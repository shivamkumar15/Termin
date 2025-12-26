import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// STATE
let holidays = [];
let currentService = "Consultation"; // Default
let weeklyConfig = {}; // Stores { Monday: {active:true, start:.., end:..} }

document.addEventListener("DOMContentLoaded", () => {
  // 1. Listeners
  document.getElementById("addHolidayBtn").addEventListener("click", addHoliday);
  document.getElementById("saveBtn").addEventListener("click", saveAvailability);
  document.getElementById("serviceSelect").addEventListener("change", (e) => {
    currentService = e.target.value;
    loadAvailability();
  });

  // 2. Initial Load
  loadHolidays();
  loadAvailability();
});

// --- AVAILABILITY LOGIC ---

async function loadAvailability() {
  const container = document.getElementById("availabilityTable");
  container.innerHTML = "<p>Loading schedule...</p>";

  try {
    const docRef = doc(db, "availability", "services", currentService, "config");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      weeklyConfig = data.days || {};
      // read stored slot duration if present
      const storedDuration = data.slotDuration;
      if (storedDuration) {
        const sel = document.getElementById('slotDuration');
        if (sel) sel.value = String(storedDuration);
      }
    } else {
      // Default config if none exists
      weeklyConfig = getDefaultConfig();
    }

    renderAvailabilityTable();

  } catch (error) {
    console.error("Error loading availability:", error);
    container.innerHTML = "<p style='color:red'>Error loading schedule.</p>";
  }
}

function getDefaultConfig() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const config = {};
  days.forEach(d => {
    config[d] = { active: true, start: "09:00", end: "17:00" };
  });
  // Weekends off by default
  config["Saturday"] = { active: false, start: "09:00", end: "17:00" };
  config["Sunday"] = { active: false, start: "09:00", end: "17:00" };
  return config;
}

function renderAvailabilityTable() {
  const container = document.getElementById("availabilityTable");
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  let html = `<div class="avail-grid" style="display:grid; grid-template-columns: 1fr 2fr; gap:1rem;">`;

  daysOrder.forEach(day => {
    const dayConfig = weeklyConfig[day] || { active: false, start: "09:00", end: "17:00" };
    const checked = dayConfig.active ? "checked" : "";
    const opacity = dayConfig.active ? "1" : "0.5";

    html += `
        <div class="day-row" style="padding:1rem; border-bottom:1px solid #f0f0f0; display:flex; align-items:center;">
            <strong>${day}</strong>
        </div>
        <div class="time-row" style="padding:1rem; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; gap:1rem; opacity:${opacity}" id="row-${day}">
            <label><input type="checkbox" ${checked} onchange="toggleDay('${day}', this)"> Available</label>
            <input type="time" id="start-${day}" value="${dayConfig.start}" ${!dayConfig.active ? 'disabled' : ''}> - 
            <input type="time" id="end-${day}" value="${dayConfig.end}" ${!dayConfig.active ? 'disabled' : ''}>
        </div>
        `;
  });

  html += `</div>`;
  container.innerHTML = html;

  // Expose toggle globally
  window.toggleDay = toggleDay;
}

function toggleDay(day, checkbox) {
  const row = document.getElementById(`row-${day}`);
  const inputs = row.querySelectorAll("input[type='time']");

  if (checkbox.checked) {
    row.style.opacity = "1";
    inputs.forEach(i => i.disabled = false);
    weeklyConfig[day].active = true;
  } else {
    row.style.opacity = "0.5";
    inputs.forEach(i => i.disabled = true);
    weeklyConfig[day].active = false;
  }
}

async function saveAvailability() {
  const btn = document.getElementById("saveBtn");
  btn.innerText = "Saving...";
  btn.disabled = true;

  // 1. Gather Data from DOM to be sure
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  daysOrder.forEach(day => {
    if (weeklyConfig[day]) { // Only update if it exists in our state
      const startInput = document.getElementById(`start-${day}`);
      const endInput = document.getElementById(`end-${day}`);
      weeklyConfig[day].start = startInput.value;
      weeklyConfig[day].end = endInput.value;
    }
  });

  try {
    const slotDuration = document.getElementById('slotDuration')?.value || '30';
    const docRef = doc(db, "availability", "services", currentService, "config");
    await setDoc(docRef, {
      days: weeklyConfig,
      slotDuration: Number(slotDuration),
      updatedAt: new Date()
    });

    alert("Availability saved!");
  } catch (error) {
    console.error("Error saving:", error);
    alert("Failed to save.");
  } finally {
    btn.innerText = "Save Availability";
    btn.disabled = false;
  }
}

// --- HOLIDAY LOGIC (Kept same) ---
async function loadHolidays() {
  const list = document.getElementById("holidayList");
  list.innerHTML = "Loading...";

  try {
    const q = query(collection(db, "holidays"), orderBy("date"));
    const snap = await getDocs(q);

    holidays = [];
    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "<li>No holidays set.</li>";
      return;
    }

    snap.forEach(docSnap => {
      const data = docSnap.data();
      holidays.push({ id: docSnap.id, ...data });

      const li = document.createElement("li");
      li.style = "display:flex; justify-content:space-between; padding:0.5rem; background:#f9f9f9; margin-bottom:0.5rem; border-radius:4px;";
      li.innerHTML = `
        <span>${data.date}</span>
        <button onclick="deleteHoliday('${docSnap.id}')" style="color:red; background:none; border:none; cursor:pointer;">&times;</button>
      `;
      list.appendChild(li);
    });

    window.deleteHoliday = deleteHoliday;

  } catch (error) {
    console.error("Error loading holidays:", error);
    list.innerHTML = "Error loading holidays.";
  }
}

async function addHoliday() {
  const dateInput = document.getElementById("holidayDate");
  const date = dateInput.value;

  if (!date) return alert("Please select a date.");

  try {
    await addDoc(collection(db, "holidays"), {
      date: date,
      createdAt: new Date()
    });
    dateInput.value = "";
    loadHolidays();
  } catch (error) {
    alert("Error adding holiday: " + error.message);
  }
}

async function deleteHoliday(id) {
  if (!confirm("Remove this holiday?")) return;

  try {
    await deleteDoc(doc(db, "holidays", id));
    loadHolidays();
  } catch (error) {
    alert("Error deleting holiday: " + error.message);
  }
}
