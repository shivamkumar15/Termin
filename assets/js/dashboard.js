import { db, auth } from "./firebase.js";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// AUTH CHECK
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = "../auth/login.html";
    } else {
        loadDashboardData();
    }
});

async function loadDashboardData() {
    try {
        // 1. Get Bookings
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, orderBy("date", "desc"), limit(5));
        const snap = await getDocs(q);

        // Stats (Mock for now, real app would count properly)
        // document.querySelector(".stat-card:nth-child(1) p").innerText = snap.size; 

        // 2. Render Recent Table
        const table = document.querySelector(".table-wrapper");
        if (snap.empty) {
            table.innerHTML = `
             <div class="empty-state">
               <i class="ri-inbox-archive-line"></i>
               <p>No reservations yet.</p>
             </div>
            `;
            return;
        }

        let html = `
        <table>
         <thead>
          <tr>
           <th>Customer</th>
           <th>Service</th>
           <th>Date</th>
           <th>Status</th>
          </tr>
         </thead>
         <tbody>
        `;

        snap.forEach(doc => {
            const data = doc.data();
            html += `
             <tr>
              <td>
                <div style="font-weight:600;">${data.name}</div>
                <div style="font-size:0.8rem; color:#888;">${data.email}</div>
              </td>
              <td>${data.service}</td>
              <td>${data.date} <br> <span style="font-size:0.8rem; color:#888;">${data.time}</span></td>
              <td><span class="status-badge confirmed">${data.status || 'Confirmed'}</span></td>
             </tr>
            `;
        });

        html += `</tbody></table>`;
        table.innerHTML = html;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// LOGOUT
window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = "../auth/login.html";
    });
};
