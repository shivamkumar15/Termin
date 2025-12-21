const customers = [
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 9876543210",
    total: 5,
    lastVisit: "2025-01-10"
  },
  {
    name: "Neha Verma",
    email: "neha@gmail.com",
    phone: "+91 9123456789",
    total: 3,
    lastVisit: "2025-01-15"
  },
  {
    name: "Amit Patel",
    email: "amit@gmail.com",
    phone: "+91 9988776655",
    total: 8,
    lastVisit: "2025-01-17"
  }
];

const table = document.getElementById("customersTable");

// Currently we have single booking
const booking = JSON.parse(localStorage.getItem("termin_booking"));

if (!booking) {
  table.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center; padding:30px;">
        No customers yet
      </td>
    </tr>
  `;
} else {
  table.innerHTML = `
    <tr>
      <td>${booking.name}</td>
      <td>${booking.email}</td>
      <td>1</td>
      <td>
        <a href="mailto:${booking.email}" class="action-btn">
          Email
        </a>
      </td>
    </tr>
  `;
}
