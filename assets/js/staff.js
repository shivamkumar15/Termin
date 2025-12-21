const staffMembers = [
  {
    name: "Amit Sharma",
    role: "Consultant",
    services: "Consultation, Follow-up"
  },
  {
    name: "Pooja Verma",
    role: "Therapist",
    services: "Therapy Session"
  },
  {
    name: "Rohit Patel",
    role: "Trainer",
    services: "Fitness Training"
  }
];

const grid = document.getElementById("staffGrid");

staffMembers.forEach(s => {
  grid.innerHTML += `
    <div class="staff-card">
      <div class="staff-header">
        <div class="avatar">${s.name.charAt(0)}</div>
        <div>
          <div class="staff-name">${s.name}</div>
          <div class="staff-role">${s.role}</div>
        </div>
      </div>

      <div class="staff-meta">
        <strong>Services:</strong> ${s.services}
      </div>

      <div class="staff-actions">
        <button>Manage Availability</button>
        <button>Edit Profile</button>
      </div>
    </div>
  `;
});
