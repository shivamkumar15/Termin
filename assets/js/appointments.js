const appointments = [
  {
    customer: "Rahul Sharma",
    service: "Consultation",
    staff: "Amit",
    date: "2025-01-18",
    time: "10:00 AM",
    status: "confirmed"
  },
  {
    customer: "Neha Verma",
    service: "Follow-up",
    staff: "Pooja",
    date: "2025-01-19",
    time: "2:00 PM",
    status: "pending"
  }
];

const table = document.getElementById("appointmentsTable");

const booking = JSON.parse(localStorage.getItem("termin_booking"));

if (!booking) {
  table.innerHTML = `
    <tr>
      <td colspan="6" style="text-align:center; padding:30px;">
        No appointments found
      </td>
    </tr>
  `;
} else {
  table.innerHTML = `
    <tr>
      <td>${booking.name}</td>
      <td>${booking.service}</td>
      <td>${booking.date}</td>
      <td>${booking.time}</td>
      <td>
        <span class="platform">${booking.platform}</span>
      </td>
      <td>
        <a href="${booking.meetingLink}" target="_blank" class="join-btn">
          Join
        </a>
      </td>
    </tr>
  `;
}
