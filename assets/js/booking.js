import { db } from "./firebase.js";
import { sendEmails } from "./email.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

const functions = getFunctions();

// STATE
let currentStep = 1;
let bookingData = {
  service: null,
  platform: null,
  date: null,
  time: null,
  name: null,
  email: null,
  notes: null
};

// CONSTANTS (Fallback if DB is empty)
const DEFAULT_SERVICES = [
  { name: "Consultation", icon: "ri-briefcase-line", duration: 30 },
  { name: "Therapy Session", icon: "ri-brain-line", duration: 60 },
  { name: "Follow-up", icon: "ri-chat-check-line", duration: 15 }
];

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  // Set min date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("datePicker").setAttribute("min", today);

  // Load services
  await loadServices();

  // Wire date picker after DOM ready
  const datePicker = document.getElementById("datePicker");
  datePicker.addEventListener("change", async (e) => {
    bookingData.date = e.target.value;
    await loadSlots(bookingData.date);
    updateSummary();
  });

  // Global navigation functions
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.selectService = selectService;
  window.selectPlatform = selectPlatform;
  window.selectTime = selectTime;
});

// FUNCTIONS

function nextStep(step) {
  if (!validateStep(step - 1)) return;

  // Hide all
  document.querySelectorAll(".step-content").forEach(el => el.classList.remove("active"));
  // Show next
  document.getElementById(`step${step}`)?.classList.add("active");

  currentStep = step;
  updateSummary();
}

function prevStep(step) {
  document.querySelectorAll(".step-content").forEach(el => el.classList.remove("active"));
  document.getElementById(`step${step}`)?.classList.add("active");
  currentStep = step;
}

function validateStep(step) {
  if (step === 1 && !bookingData.service) return false;
  if (step === 2 && !bookingData.platform) return false;
  if (step === 3 && (!bookingData.date || !bookingData.time)) return false;
  return true;
}

// STEP 1: SERVICES
async function loadServices() {
  const grid = document.getElementById("serviceGrid");
  grid.innerHTML = "";

  // Try fetching from DB, else use default
  // For now using default array for simplicity unless we populate DB
  DEFAULT_SERVICES.forEach(s => {
    const div = document.createElement("div");
    div.className = "selection-card";
    div.onclick = () => selectService(s.name, div);
    div.innerHTML = `
            <i class="${s.icon}"></i>
            <h3>${s.name}</h3>
            <p style="font-size:0.8rem; color:#888;">${s.duration} mins</p>
        `;
    grid.appendChild(div);
  });
}

function selectService(name, el) {
  bookingData.service = name;

  // Attach duration from defaults if available
  const svc = DEFAULT_SERVICES.find(s => s.name === name);
  bookingData.duration = svc ? svc.duration : 30;

  // UI update
  document.querySelectorAll("#serviceGrid .selection-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");

  document.getElementById("btnStep1").disabled = false;
  updateSummary();
}

// STEP 2: PLATFORM
function selectPlatform(name, el) {
  bookingData.platform = name;

  document.querySelectorAll("#platformGrid .selection-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");

  document.getElementById("btnStep2").disabled = false;
  updateSummary();
}

// STEP 3: DATE & TIME

async function loadSlots(dateStr) {
  const container = document.getElementById("slotsContainer");
  container.innerHTML = "<p>Loading slots from server...</p>";

  try {
    const checkAvailability = httpsCallable(functions, 'checkAvailability');
    const result = await checkAvailability({
      date: dateStr,
      service: bookingData.service
    });

    const debugResult = result.data; // .data from callable

    // Cloud function returns: { available: bool, slots: [], reason: string }
    const { available, slots, reason } = debugResult;

    if (!available) {
      container.innerHTML = `<p>${reason || "Not available on this date."}</p>`;
      return;
    }

    if (!slots || slots.length === 0) {
      container.innerHTML = "<p>No slots available.</p>";
      return;
    }

    container.innerHTML = "";
    slots.forEach(time => {
      const btn = document.createElement("button");
      btn.className = "time-slot";
      btn.innerText = time;
      btn.onclick = () => selectTime(time, btn);
      container.appendChild(btn);
    });

  } catch (error) {
    console.error("Error loading slots:", error);
    container.innerHTML = `<p style='color:red;'>Error: ${error.message}</p>`;
  }
}

// Helper functions removed as logic moved to backend

function selectTime(time, el) {
  bookingData.time = time;

  document.querySelectorAll(".time-slot").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");

  document.getElementById("btnStep3").disabled = false;
  updateSummary();
}


// UPDATING SIDEBAR
function updateSummary() {
  if (bookingData.service)
    document.querySelector("#summaryService span").innerText = bookingData.service;
  if (bookingData.platform)
    document.querySelector("#summaryPlatform span").innerText = bookingData.platform;
  if (bookingData.date)
    document.querySelector("#summaryDate span").innerText = bookingData.date;
  if (bookingData.time)
    document.querySelector("#summaryTime span").innerText = bookingData.time;
}

// SUBMIT REST
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.innerText = "Processing Details...";
  submitBtn.disabled = true;

  bookingData.name = document.getElementById("customerName").value;
  bookingData.email = document.getElementById("customerEmail").value;
  bookingData.notes = document.getElementById("customerNotes").value;
  // Status will be set by backend
  // bookingData.status = "Confirmed"; 
  bookingData.createdAt = new Date(); // Client side timestamp for reference, reliable TS in backend

  try {
    // 1. Create Payment Order via Cloud Function
    const createPaymentOrder = httpsCallable(functions, 'createPaymentOrder');

    // Calculate amount based on service (Mock logic or fetch real price)
    // TODO: Fetch real price from DB or Config
    const priceMap = {
      "Consultation": 500,
      "Therapy Session": 1000,
      "Follow-up": 200
    };
    const amount = priceMap[bookingData.service] || 500; // Default 500 INR

    const orderRes = await createPaymentOrder({
      amount: amount,
      currency: "INR"
    });

    const order = orderRes.data.data; // .data (callable result) .data (function response)

    if (!order || !order.id) {
      throw new Error("Failed to create payment order");
    }

    // 2. Open Razorpay Checkout
    const options = {
      "key": "rzp_test_YOUR_KEY_HERE", // TODO: Move to config
      "amount": order.amount,
      "currency": order.currency,
      "name": "Termin Booking",
      "description": `${bookingData.service} with Termin`,
      "order_id": order.id,
      "handler": async function (response) {
        // 3. Payment Success -> Confirm Booking
        submitBtn.innerText = "Verifying Payment...";

        try {
          const confirmBooking = httpsCallable(functions, 'confirmBooking');
          const result = await confirmBooking({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            bookingDetails: bookingData
          });

          if (result.data.success) {
            // Success UI
            // Send Email via Client (Optional fallback) or rely on Backend
            // We rely on Backend for emails now as per requirements

            document.querySelectorAll(".step-content").forEach(el => el.classList.remove("active"));
            document.getElementById("stepSuccess").classList.add("active");
          } else {
            throw new Error("Booking confirmation failed on server.");
          }

        } catch (err) {
          console.error(err);
          alert("Payment successful but booking failed: " + err.message);
          submitBtn.innerText = "Confirm Booking";
          submitBtn.disabled = false;
        }
      },
      "prefill": {
        "name": bookingData.name,
        "email": bookingData.email
      },
      "theme": {
        "color": "#3399cc"
      },
      "modal": {
        "ondismiss": function () {
          submitBtn.innerText = "Confirm Booking";
          submitBtn.disabled = false;
        }
      }
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();

  } catch (error) {
    console.error(error);
    alert("Error initializing payment: " + error.message);
    submitBtn.innerText = "Confirm Booking";
    submitBtn.disabled = false;
  }
});