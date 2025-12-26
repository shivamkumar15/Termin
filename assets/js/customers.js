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
    loadCustomers();
  }
});

async function loadCustomers() {
  const tbody = document.getElementById("customersTable");
  tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Loading...</td></tr>";

  try {
    const q = query(collection(db, "bookings"));
    const snap = await getDocs(q);

    if (snap.empty) {
      tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No customers found.</td></tr>";
      return;
    }

    const customers = {};

    snap.forEach(doc => {
      const data = doc.data();
      if (!data.email) return;

      if (!customers[data.email]) {
        customers[data.email] = {
          name: data.name,
          email: data.email,
          count: 0
        };
      }
      customers[data.email].count++;
    });

    tbody.innerHTML = "";
    Object.values(customers).forEach(c => {

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox"></td>
        <td>
          <div class="user-info">
             <div class="user-avatar">${c.name.charAt(0)}</div>
             <p>${c.name}</p>
          </div>
        </td>
        <td>
          <div style="font-size:0.9rem;">
            <div><i class="ri-mail-line" style="vertical-align:middle; margin-right:4px; color:var(--neutral-400);"></i> ${c.email}</div>
            <div style="margin-top:4px;"><i class="ri-phone-line" style="vertical-align:middle; margin-right:4px; color:var(--neutral-400);"></i> +91 98765 43210</div>
          </div>
        </td>
        <td>
           <span class="status-badge pending" style="background:var(--primary-50); color:var(--primary-700); border:none;">${c.count} Bookings</span>
        </td>
        <td>
          <button class="action-btn" title="View Profile"><i class="ri-eye-line"></i></button>
          <button class="action-btn" title="Email"><i class="ri-mail-send-line"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error:", error);
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:red;'>Error loading data.</td></tr>";
  }
}

window.logout = () => {
  auth.signOut().then(() => {
    window.location.href = "../auth/login.html";
  });
};
