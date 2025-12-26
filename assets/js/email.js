const ADMIN_EMAIL = "admin@termin.app";

async function sendCustomerEmail(booking) {
  if (window.emailjs) {
    // Replace with your EmailJS service/template IDs
    const serviceId = 'service_termin';
    const templateId = 'template_booking_confirmation';
    const params = {
      to_name: booking.name,
      to_email: booking.email,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      platform: booking.platform,
      notes: booking.notes || ''
    };
    return window.emailjs.send(serviceId, templateId, params);
  } else {
    console.log('EmailJS not available, customer email:', booking.email);
    return Promise.resolve();
  }
}

async function sendAdminEmail(booking) {
  if (window.emailjs) {
    const serviceId = 'service_termin';
    const templateId = 'template_admin_notification';
    const params = {
      admin_email: ADMIN_EMAIL,
      customer_name: booking.name,
      customer_email: booking.email,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      platform: booking.platform
    };
    return window.emailjs.send(serviceId, templateId, params);
  } else {
    console.log('EmailJS not available, admin notification:', ADMIN_EMAIL);
    return Promise.resolve();
  }
}

export async function sendEmails(booking) {
  try {
    await Promise.allSettled([
      sendCustomerEmail(booking),
      sendAdminEmail(booking)
    ]);
  } catch (err) {
    console.warn('sendEmails error', err);
  }
}
