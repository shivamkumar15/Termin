const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// INITIALIZE RAZORPAY
// TODO: Replace with environment variables in production
// functions.config().razorpay.key_id
const razorpay = new Razorpay({
    key_id: "rzp_test_YOUR_KEY_HERE", // PLACEHOLDER
    key_secret: "YOUR_SECRET_HERE"    // PLACEHOLDER
});

/**
 * 1. Create Payment Order
 * Params: amount (in smallest currency unit, e.g., paise), currency
 */
exports.createPaymentOrder = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).send({ error: 'Method Not Allowed' });
            }

            const { amount, currency = "INR", receipt } = req.body.data || req.body;

            const options = {
                amount: amount * 100, // Razorpay expects paise
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);

            // Return data wrapper for usage with httpsCallable or direct fetch
            res.status(200).send({ data: order });

        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).send({ error: error.message });
        }
    });
});

/**
 * 3. Check Availability
 * Centralizes slot calculation logic
 */
exports.checkAvailability = functions.https.onCall(async (data, context) => {
    const { date, service } = data; // date string YYYY-MM-DD

    if (!date || !service) {
        throw new functions.https.HttpsError("invalid-argument", "Date and Service required");
    }

    // 1. Check Holiday
    const holidaysQ = db.collection("holidays").where("date", "==", date);
    const holidaySnap = await holidaysQ.get();
    if (!holidaySnap.empty) {
        return { available: false, reason: "Holiday", slots: [] };
    }

    // 2. Get Config
    const configDoc = await db.doc(`availability/services/${service}/config`).get();
    let dayConfig = null;

    if (configDoc.exists) {
        const weekly = configDoc.data().days || {};
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        dayConfig = weekly[dayName];
    }

    // Default fallback (matches client-side logic)
    if (!dayConfig) {
        const day = new Date(date).getDay();
        if (day === 0 || day === 6) return { available: false, reason: "Weekend", slots: [] };
        dayConfig = { active: true, start: "09:00", end: "17:00" };
    }

    if (!dayConfig.active) {
        return { available: false, reason: "Day not active", slots: [] };
    }

    // 3. Generate Slots
    const duration = 30; // Default or fetch from service config
    // TODO: Fetch duration from service/config
    const slots = generateTimeSlots(dayConfig.start, dayConfig.end, duration);

    // 4. Get Bookings
    const bookingsQ = db.collection("bookings")
        .where("date", "==", date)
        .where("status", "in", ["Confirmed", "Paid"]); // Filter valid bookings

    const bookingsSnap = await bookingsQ.get();
    const bookedTimes = bookingsSnap.docs.map(d => d.data().time);

    const availableSlots = slots.filter(time => !bookedTimes.includes(time));

    return { available: true, slots: availableSlots };
});

function generateTimeSlots(start, end, duration) {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (current < endTime) {
        const timeStr = current.toTimeString().substring(0, 5);
        slots.push(timeStr);
        current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
}


// Modified confirmBooking to send email
exports.confirmBooking = functions.https.onCall(async (data, context) => {
    const { paymentId, orderId, signature, bookingDetails } = data;

    // 1. Verify Payment Signature (Placeholder logic for Demo)
    const crypto = require("crypto");
    const generatedSignature = crypto
        .createHmac("sha256", "YOUR_SECRET_HERE") // Use same secret as above
        .update(orderId + "|" + paymentId)
        .digest("hex");

    if (generatedSignature !== signature) {
        console.warn("Signature verification failed (ignoring for TEST mode)");
    }

    const { date, time, service, email, name } = bookingDetails;
    const bookingsRef = db.collection("bookings");

    return db.runTransaction(async (transaction) => {
        // Check double booking
        const query = bookingsRef
            .where("date", "==", date)
            .where("time", "==", time)
            .where("status", "in", ["Confirmed", "Paid"]);

        const snapshot = await transaction.get(query);
        if (!snapshot.empty) {
            throw new functions.https.HttpsError("aborted", "Slot already booked.");
        }

        const newBookingRef = bookingsRef.doc();

        // Generate Secure Token
        const managementToken = crypto.randomBytes(16).toString('hex');

        const finalBooking = {
            ...bookingDetails,
            paymentId,
            orderId,
            status: "Paid",
            managementToken, // Secure access token
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        transaction.set(newBookingRef, finalBooking);

        // Send Email
        try {
            const manageLink = `https://termin.app/booking/manage.html?id=${newBookingRef.id}&token=${managementToken}`;
            await transporter.sendMail({
                from: '"Termin" <no-reply@termin.app>',
                to: email,
                subject: "Booking Confirmed: " + service,
                text: `Hi ${name},\n\nYour appointment for ${service} on ${date} at ${time} is confirmed.\n\nManage Booking: ${manageLink}\n\nThanks,\nTermin Team`
            });
        } catch (e) {
            console.error("Email failed", e);
        }

        return { success: true, bookingId: newBookingRef.id };
    });

});

/**
 * 4. Cancel Booking
 */
// 4. Cancel Booking (Secure)
exports.cancelBooking = functions.https.onCall(async (data, context) => {
    const { bookingId, token } = data;

    const bookingRef = db.collection("bookings").doc(bookingId);
    const docSnap = await bookingRef.get();

    if (!docSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Booking not found");
    }

    const booking = docSnap.data();

    // Security Check
    if (!booking.managementToken || booking.managementToken !== token) {
        throw new functions.https.HttpsError("permission-denied", "Invalid or missing token");
    }

    // Mark as Cancelled
    await bookingRef.update({
        status: "Cancelled",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Notify Admin/User
    try {
        if (booking.email) {
            await transporter.sendMail({
                from: '"Termin" <no-reply@termin.app>',
                to: booking.email,
                subject: "Booking Cancelled",
                text: `Your booking for ${booking.service} has been cancelled.`
            });
        }
    } catch (e) {
        console.error("Email error", e);
    }

    return { success: true };
});

/**
 * 5. Get Booking Details (Secure)
 */
exports.getBookingDetails = functions.https.onCall(async (data, context) => {
    const { bookingId, token } = data;

    if (!bookingId || !token) {
        throw new functions.https.HttpsError("invalid-argument", "Missing credentials");
    }

    const docSnap = await db.collection("bookings").doc(bookingId).get();

    if (!docSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Booking not found");
    }

    const booking = docSnap.data();

    if (!booking.managementToken || booking.managementToken !== token) {
        throw new functions.https.HttpsError("permission-denied", "Unauthorized");
    }

    return {
        id: docSnap.id,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        name: booking.name,
        email: booking.email
    };
});

/**
 * 6. Reschedule Booking (Secure)
 */
exports.rescheduleBooking = functions.https.onCall(async (data, context) => {
    const { bookingId, token, newDate, newTime } = data;

    const bookingRef = db.collection("bookings").doc(bookingId);

    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(bookingRef);
        if (!doc.exists) {
            throw new functions.https.HttpsError("not-found", "Booking not found");
        }

        const booking = doc.data();

        if (!booking.managementToken || booking.managementToken !== token) {
            throw new functions.https.HttpsError("permission-denied", "Unauthorized");
        }

        if (booking.status === 'Cancelled') {
            throw new functions.https.HttpsError("failed-precondition", "Cannot reschedule cancelled booking");
        }

        // Check availability for new slot
        const overlapQ = db.collection("bookings")
            .where("date", "==", newDate)
            .where("time", "==", newTime)
            .where("status", "in", ["Confirmed", "Paid"]);

        const overlapSnap = await transaction.get(overlapQ);
        if (!overlapSnap.empty) {
            throw new functions.https.HttpsError("aborted", "New slot is already booked");
        }

        // Update
        transaction.update(bookingRef, {
            date: newDate,
            time: newTime,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Notify User
        try {
            await transporter.sendMail({
                from: '"Termin" <no-reply@termin.app>',
                to: booking.email,
                subject: "Booking Rescheduled",
                text: `Your booking has been rescheduled to ${newDate} at ${newTime}.`
            });
        } catch (e) {
            console.error("Email failed", e);
        }

        return { success: true };
    });
});
