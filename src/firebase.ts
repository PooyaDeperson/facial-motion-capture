// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfLs1JiSY7IDxmTTLf18l__6cu4Xax7Ag",
  authDomain: "project-934117417237.firebaseapp.com",
  projectId: "project-934117417237",
  storageBucket: "project-934117417237.appspot.com",
  messagingSenderId: "934117417237",
  appId: "1:934117417237:web:cee24304dd3342b3a9091c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
