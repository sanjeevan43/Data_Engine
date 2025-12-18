import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyCU4dKNAMZ2FoEzPmqWz9QdzV_4bTrwZLQ",
    authDomain: "school-5059f.firebaseapp.com",
    projectId: "school-5059f",
    storageBucket: "school-5059f.firebasestorage.app",
    messagingSenderId: "501290461188",
    appId: "1:501290461188:web:f822cdd16df8c39f67ed51",
    measurementId: "G-X8T0NME25F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

