function sendEmail(booking) {
  console.log("📧 Sending email to:", booking.email);

  const emailContent = `
    Hi ${booking.name},

    Your appointment is confirmed!

    Service: ${booking.service}
    Date: ${booking.date}
    Time: ${booking.time}
    Platform: ${booking.platform}

    Join Meeting:
    ${booking.meetingLink}

    — Termin
  `;

  console.log("📨 EMAIL BODY:");
  console.log(emailContent);

  return true;
}
const ADMIN_EMAIL = "admin@termin.app";

function sendCustomerEmail(booking) {
  console.log("📧 Customer email sent to:", booking.email);
}

function sendAdminEmail(booking) {
  console.log("📧 Admin notified at:", ADMIN_EMAIL);

  console.log(`
    NEW BOOKING ALERT

    Customer: ${booking.name}
    Email: ${booking.email}
    Service: ${booking.service}
    Date: ${booking.date}
    Time: ${booking.time}
    Platform: ${booking.platform}

    Join: ${booking.meetingLink}
  `);
}

function sendEmails(booking) {
  sendCustomerEmail(booking);
  sendAdminEmail(booking);
}
