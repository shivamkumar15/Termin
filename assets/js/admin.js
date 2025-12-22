import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//  Protect admin page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/auth/login.html";
  } else {
    loadBookings();
  }
});

//  Load bookings
async function loadBookings() {
  const table = document.getElementById("bookingsTable");
  table.innerHTML = "";

  const q = query(
    collection(db, "bookings"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {
    const b = docSnap.data();
    const id = docSnap.id;

    table.innerHTML += `
      <tr>
        <td>${b.name}</td>
        <td>${b.email}</td>
        <td>${b.service}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td>${b.platform}</td>
        <td>
          <button data-id="${id}" class="delete-btn">Delete</button>
        </td>
      </tr>
    `;
  });

  attachDeleteEvents();
}

//  DELETE booking
function attachDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const bookingId = btn.dataset.id;

      const confirmDelete = confirm("Delete this booking?");
      if (!confirmDelete) return;

      await deleteDoc(doc(db, "bookings", bookingId));
      loadBookings(); // refresh table
    });
  });
}

//  Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
