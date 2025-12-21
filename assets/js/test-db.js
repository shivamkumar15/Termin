import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function testDB() {
  await addDoc(collection(db, "test"), {
    message: "Firebase connected successfully 🚀",
    createdAt: new Date()
  });

  console.log("Data written to Firestore");
}

testDB();
