import { db, auth } from "./firebase.js";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// AUTH CHECK
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = "../auth/login.html";
    } else {
        loadDashboardData();
    }
});

async function loadDashboardData() {
    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, orderBy("date", "desc"));
        const snap = await getDocs(q);

        // 1. Calculate Stats
        const totalAppointments = snap.size;

        const uniqueCustomers = new Set();
        let totalRevenue = 0;

        const servicePrices = {
            "Consultation": 500,
            "Therapy": 1000,
            "Training": 800,
            "default": 500
        };

        const today = new Date().toISOString().split('T')[0];
        let upcomingCount = 0;

        snap.forEach(doc => {
            const data = doc.data();
            if (data.email) uniqueCustomers.add(data.email);
            totalRevenue += (data.price || servicePrices[data.service] || servicePrices['default']);

            if (data.date >= today && data.status !== 'cancelled') {
                upcomingCount++;
            }
        });

        // 2. Update Stats (ID based)
        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.querySelector(".stat-value").innerText = value;
        };

        updateStat("stat-appointments", upcomingCount); // Showing upcoming count in the first card as per label "Upcoming Appointments" in HTML
        // OR if label is "Appointments" (Total), use totalAppointments. 
        // HTML Label says "Upcoming Appointments". I will use upcomingCount.

        updateStat("stat-revenue", "₹" + totalRevenue.toLocaleString());
        updateStat("stat-customers", uniqueCustomers.size);
        updateStat("stat-utilization", "82%"); // Mock for now

        // 3. Render Upcoming List (Left Widget)
        const upcomingList = document.getElementById("upcomingList");
        if (upcomingList) {
            // Filter and sort for actual upcoming
            const docs = snap.docs.map(d => d.data());
            const upcoming = docs
                .filter(d => d.date >= today && d.status !== 'cancelled')
                .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                .slice(0, 4);

            if (upcoming.length === 0) {
                upcomingList.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No upcoming appointments.</p>`;
            } else {
                upcomingList.innerHTML = upcoming.map(appt => `
                   <div class="appointment-item">
                      <div class="appt-time">${appt.time}</div>
                      <div class="appt-details">
                        <h4>${appt.service} with ${appt.name}</h4>
                        <p>${appt.date} • ${appt.status || 'Confirmed'}</p>
                      </div>
                   </div>
                `).join('');
            }
        }

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// LOGOUT
window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = "../auth/login.html";
    });
};
