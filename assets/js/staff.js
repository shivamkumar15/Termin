import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../auth/login.html";
  } else {
    loadStaff();
    setupAddStaff();
  }
});

async function loadStaff() {
  const grid = document.getElementById("staffGrid");
  grid.innerHTML = "<p>Loading staff...</p>";

  try {
    const snap = await getDocs(collection(db, "staff"));
    grid.innerHTML = "";

    if (snap.empty) {
      grid.innerHTML = "<p>No staff members found. Add one!</p>";
    }

    snap.forEach(documentSnapshot => {
      const s = documentSnapshot.data();
      const id = documentSnapshot.id;

      grid.innerHTML += `
        <div class="staff-card">
          <div class="staff-header">
            <div class="avatar">${s.name.charAt(0)}</div>
            <div class="staff-info">
              <h3>${s.name}</h3>
              <span class="staff-role">${s.role || 'Staff'}</span>
            </div>
          </div>

          <div class="staff-details">
            <div class="detail-item">
               <span class="detail-label">Status</span>
               <span class="detail-value" style="color:var(--success)">Available</span>
            </div>
             <div class="detail-item">
               <span class="detail-label">Services</span>
               <span class="detail-value">${s.services || 'General'}</span>
            </div>
          </div>

          <div class="staff-actions">
            <button class="btn-outline" title="Edit Profile"><i class="ri-pencil-line"></i> Edit</button>
            <button class="btn-outline danger" onclick="deleteStaff('${id}')" title="Remove"><i class="ri-delete-bin-line"></i> Delete</button>
          </div>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error loading staff:", error);
    grid.innerHTML = "<p>Error loading staff.</p>";
  }
}

function setupAddStaff() {
  // Check if modal exists, if not create it (simplification for adding functionality without major HTML overhaul)
  const btn = document.querySelector(".primary-btn");
  btn.onclick = async () => {
    const name = prompt("Enter Name:");
    if (!name) return;
    const role = prompt("Enter Role:");
    const services = prompt("Enter Services (comma separated):");

    if (name && role) {
      try {
        await addDoc(collection(db, "staff"), {
          name, role, services: services || ""
        });
        loadStaff();
      } catch (e) {
        alert("Error adding staff");
      }
    }
  };
}

window.deleteStaff = async (id) => {
  if (confirm("Delete this staff member?")) {
    try {
      await deleteDoc(doc(db, "staff", id));
      loadStaff();
    } catch (e) {
      console.error(e);
      alert("Error deleting staff");
    }
  }
};

window.logout = () => {
  auth.signOut().then(() => {
    window.location.href = "../auth/login.html";
  });
};
