import { db, auth } from "./firebase.js";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../auth/login.html";
    } else {
        loadSettings();
        setupSave();
    }
});

async function loadSettings() {
    try {
        const docRef = doc(db, "settings", "general");
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            const data = snap.data();
            document.getElementById("businessName").value = data.businessName || "";
            document.getElementById("businessEmail").value = data.businessEmail || "";
        }
    } catch (e) {
        console.error("Error loading settings:", e);
    }
}

function setupSave() {
    const form = document.querySelector("form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = form.querySelector("button");
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const businessName = document.getElementById("businessName").value;
        const businessEmail = document.getElementById("businessEmail").value;

        try {
            await setDoc(doc(db, "settings", "general"), {
                businessName,
                businessEmail,
                updatedAt: serverTimestamp()
            }, { merge: true });

            alert("Settings saved!");
        } catch (e) {
            console.error("Error saving settings:", e);
            alert("Error saving settings.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = "../auth/login.html";
    });
};
