import { db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});


const table = document.getElementById("bookingTable");

const loadBookings = async () => {
  const querySnapshot = await getDocs(collection(db, "bookings"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const row = `
      <tr>
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.service}</td>
        <td>${data.date}</td>
        <td>${data.time}</td>
        <td>${data.platform}</td>
      </tr>
    `;

    table.innerHTML += row;
  });
};
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

loadBookings();
