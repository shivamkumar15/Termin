import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
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
    snap.forEach(documentSnapshot => {
      const data = documentSnapshot.data();
      const tr = document.createElement("tr");

      const isCancelled = data.status === 'cancelled';
      const statusClass = (data.status || 'Confirmed').toLowerCase();

      // Determine Status Badge HTML
      let statusBadge = `<span class="status-badge ${statusClass}">${data.status || 'Confirmed'}</span>`;

      tr.innerHTML = `
        <td><input type="checkbox"></td>
        <td>
          <div class="user-info">
             <div class="user-avatar">${data.name.charAt(0)}</div>
             <div>
               <p>${data.name}</p>
               <small>${data.time}</small>
             </div>
          </div>
        </td>
        <td>${data.service}</td>
        <td>${statusBadge}</td>
        <td>
           <div style="display:flex; gap:0.5rem;">
              <button class="action-btn" title="Confirm"><i class="ri-check-line"></i></button>
              <button class="action-btn" title="Reschedule"><i class="ri-history-line"></i></button>
              ${!isCancelled ? `<button class="action-btn cancel-btn" data-id="${documentSnapshot.id}" title="Cancel Booking"><i class="ri-close-circle-line" style="color:red;"></i></button>` : ''}
              <button class="action-btn" title="Edit"><i class="ri-pencil-line"></i></button>
           </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach event listeners to buttons
    document.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
          const id = btn.getAttribute('data-id');
          await cancelBooking(id);
        }
      });
    });

  } catch (error) {
    console.error("Error:", error);
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>Error loading data.</td></tr>";
  }
}

async function cancelBooking(id) {
  try {
    await updateDoc(doc(db, "bookings", id), {
      status: 'cancelled'
    });
    alert('Booking cancelled.');
    loadAppointments(); // Reload to update UI
  } catch (error) {
    console.error("Error cancelling:", error);
    alert('Failed to cancel booking.');
  }
}

window.logout = () => {
  auth.signOut().then(() => {
    window.location.href = "../auth/login.html";
  });
};
