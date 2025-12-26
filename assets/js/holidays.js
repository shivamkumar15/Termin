import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Protect page
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "../auth/login.html";
});

const form = document.getElementById("holidayForm");
const list = document.getElementById("holidayList");
const dateInput = document.getElementById("holidayDate");

async function loadHolidays() {
  list.innerHTML = "Loading...";
  try {
    const snap = await getDocs(collection(db, "holidays"));
    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "<li>No holidays set.</li>";
      return;
    }

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const li = document.createElement('li');
      li.style = "display:flex; justify-content:space-between; padding:0.5rem; background:#f9f9f9; margin-bottom:0.5rem; border-radius:4px;";
      li.innerHTML = `
        <span>${data.date}</span>
        <button data-id="${docSnap.id}" class="delete-holiday" style="color:red; background:none; border:none; cursor:pointer;">&times;</button>
      `;
      list.appendChild(li);
    });

    document.querySelectorAll('.delete-holiday').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!confirm('Remove this holiday?')) return;
        await deleteDoc(doc(db, 'holidays', id));
        loadHolidays();
      });
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = 'Error loading holidays.';
  }
}

loadHolidays();

// Add holiday via form or date input
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = dateInput.value;
    if (!date) return alert('Please choose a date.');

    try {
      await addDoc(collection(db, 'holidays'), { date, createdAt: new Date() });
      dateInput.value = '';
      loadHolidays();
    } catch (err) {
      alert('Error saving holiday: ' + err.message);
    }
  });
}
