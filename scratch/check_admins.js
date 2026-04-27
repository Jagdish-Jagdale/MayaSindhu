
import { db } from '../src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkAdmins() {
  try {
    const snapshot = await getDocs(collection(db, 'admins'));
    const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Admins found:", JSON.stringify(admins, null, 2));
  } catch (err) {
    console.error("Error fetching admins:", err);
  }
  process.exit(0);
}

checkAdmins();
