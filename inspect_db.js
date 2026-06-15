import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqywc8WRtSrVu6qoiV8YQVgSI64Hakdhk",
  authDomain: "mayasindhu-a8f9a.firebaseapp.com",
  projectId: "mayasindhu-a8f9a",
  storageBucket: "mayasindhu-a8f9a.firebasestorage.app",
  messagingSenderId: "727443774618",
  appId: "1:727443774618:web:fa42225cf48ec9e963d323"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    console.log("Product:", docSnap.id, "Name:", data.name, "Images:", data.images);
    const subSnap = await getDocs(collection(db, 'products', docSnap.id, 'variants'));
    for (const subDoc of subSnap.docs) {
      console.log("  Variant:", subDoc.id, "Data:", subDoc.data());
    }
  }
}
run().catch(console.error);
