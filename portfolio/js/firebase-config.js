// =====================================================================
//  FIREBASE SETTINGS FOR THE BLOG  (see BLOG-SETUP.md for the steps)
//
//  1. The config object comes from Firebase console →
//     Project settings → General → Your apps → Web app → "Config".
//     These values are NOT secret: every Firebase web app ships them
//     to the browser. Security comes from firestore.rules.
//     Keep the word "export" in front of each const: js/blog.js imports them.
//
//  2. ADMIN_EMAILS = the Google account(s) allowed to review & publish.
//     Keep this list the SAME as the email list in firestore.rules.
// =====================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyAifnUOeS21NinlhtqXxUFxl5zk-hBlDYI",
  authDomain: "shafyet-jamil.firebaseapp.com",
  projectId: "shafyet-jamil",
  storageBucket: "shafyet-jamil.firebasestorage.app",
  messagingSenderId: "89945051675",
  appId: "1:89945051675:web:22361ac0295106bd825ebe",
  measurementId: "G-QFQR4ZFT0T",
};

export const ADMIN_EMAILS = ["shafayetjamil000@gmail.com"];

// Only for local testing with the Firebase Emulator Suite. Leave as null.
export const EMULATOR = null;
