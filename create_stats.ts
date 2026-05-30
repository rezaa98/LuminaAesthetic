import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const fbConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(fbConfig);
const db = getFirestore(app);

async function init() {
  await setDoc(doc(db, 'stats', 'overview'), { totalScans: 4000 });
  console.log('Set initial stats to 4000');
  process.exit(0);
}
init();
