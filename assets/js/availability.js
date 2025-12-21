const days = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday"
];

const container = document.getElementById("availabilityTable");

const saved = JSON.parse(localStorage.getItem("termin_availability"));

function renderAvailability() {
  container.innerHTML = "";

  days.forEach(day => {
    const data = saved?.[day] || {
      enabled: day !== "Sunday",
      start: "09:00",
      end: "17:00"
    };

    container.innerHTML += `
      <div class="row">
        <label>${day}</label>
        <input type="checkbox" ${data.enabled ? "checked" : ""} data-day="${day}" />
        <input type="time" value="${data.start}" data-start="${day}" />
        <input type="time" value="${data.end}" data-end="${day}" />
      </div>
    `;
  });
}

function saveAvailability() {
  const availability = {};
  const duration = document.getElementById("slotDuration").value;

  days.forEach(day => {
    availability[day] = {
      enabled: document.querySelector(`[data-day="${day}"]`).checked,
      start: document.querySelector(`[data-start="${day}"]`).value,
      end: document.querySelector(`[data-end="${day}"]`).value
    };
  });

  availability.slotDuration = duration;

  localStorage.setItem("termin_availability", JSON.stringify(availability));
  alert("Availability saved!");
}

renderAvailability();
