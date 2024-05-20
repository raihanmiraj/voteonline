import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// import dotenv from 'dotenv';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// dotenv.config();
 
 console.log(import.meta.env.VITE_AUTH_DOMAIN)
 const firebaseConfig = {
  apiKey: "AIzaSyDXhM674OM9avcden_dFvaZBk-Rwerid2Y",
  authDomain: "fir-auth-a3e7d.firebaseapp.com",
  projectId: "fir-auth-a3e7d",
  storageBucket: "fir-auth-a3e7d.appspot.com",
  messagingSenderId: "95969138947",
  appId: "1:95969138947:web:0ef44980890d9a2ddb3136"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyBHSlGdWVHoTRp5n8kkqVVHE-j02k_Rzqc",
//   authDomain: "hoichoidev-f27a5.firebaseapp.com",
//   projectId: "hoichoidev-f27a5",
//   storageBucket: "hoichoidev-f27a5.appspot.com",
//   messagingSenderId: "579988425072",
//   appId: "1:579988425072:web:29fd71348b5d7ab92767b5",
//   measurementId: "G-VNL3TW7L1V"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;