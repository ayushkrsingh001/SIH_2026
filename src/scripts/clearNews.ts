import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

async function clearOldNews() {
  console.log("Clearing old news...");
  const q = collection(db, 'legalNews');
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} legalNews documents to delete.`);
  for (const doc of snap.docs) {
    await deleteDoc(doc.ref);
  }
  
  console.log("Clearing old newsQuiz...");
  const quizQ = collection(db, 'newsQuiz');
  const quizSnap = await getDocs(quizQ);
  console.log(`Found ${quizSnap.size} newsQuiz documents to delete.`);
  for (const doc of quizSnap.docs) {
    await deleteDoc(doc.ref);
  }
  
  console.log("Done clearing old news.");
}

clearOldNews();
