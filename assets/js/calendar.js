const grid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const list = document.getElementById("appointmentsList");

let date = new Date();
const booking = JSON.parse(localStorage.getItem("termin_booking"));

function renderCalendar() {
  grid.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();

  monthYear.innerText = date.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += `<div class="day"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasBooking = booking && booking.date === fullDate;

    grid.innerHTML += `
      <div class="day ${hasBooking ? "has-booking" : ""}" onclick="showDay('${fullDate}')">
        <div class="day-number">${day}</div>
        ${hasBooking ? `<div class="badge">1 Booking</div>` : ""}
      </div>
    `;
  }
}

function showDay(selectedDate) {
  if (booking && booking.date === selectedDate) {
    list.innerHTML = `
      <p><strong>${booking.time}</strong> – ${booking.name}</p>
      <p>${booking.service}</p>
      <a href="${booking.meetingLink}" target="_blank">Join Meeting</a>
    `;
  } else {
    list.innerHTML = "No appointments for this day";
  }
}

function prevMonth() {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
}

renderCalendar();
