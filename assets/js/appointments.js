import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../auth/login.html";
  } else {
    loadAppointments();
  }
});

async function loadAppointments() {
  const tbody = document.getElementById("appointmentsTable");
  tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Loading...</td></tr>";

  try {
    const q = query(collection(db, "bookings"), orderBy("date", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No appointments found.</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
              <td>
                <div class="user-info">
                   <div class="user-avatar">${data.name.charAt(0)}</div>
                   <div>
                     <p>${data.name}</p>
                     <small>${data.email}</small>
                   </div>
                </div>
              </td>
              <td>${data.service}</td>
              <td>${data.date}</td>
              <td>${data.time}</td>
              <td>${data.platform}</td>
              <td>
                <button class="action-btn" title="View Details"><i class="ri-eye-line"></i></button>
              </td>
            `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error:", error);
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>Error loading data.</td></tr>";
  }
}

window.logout = () => {
  auth.signOut().then(() => {
    window.location.href = "../auth/login.html";
  });
};
