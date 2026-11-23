// =====================================================================
//  FIREBASE SETTINGS FOR THE BLOG  (see BLOG-SETUP.md for the steps)
//
//  1. Paste the config object from Firebase console →
//     Project settings → General → Your apps → Web app → "Config".
//     These values are NOT secret: every Firebase web app ships them
//     to the browser. Security comes from firestore.rules.
//
//  2. ADMIN_EMAILS = the Google account(s) allowed to review & publish.
//     Keep this list the SAME as the email list in firestore.rules.
//
//  While the config is empty the blog works exactly as before:
//  it shows only the Markdown posts from posts/posts.json.
// =====================================================================
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAifnUOeS21NinlhtqXxUFxl5zk-hBlDYI",
    authDomain: "shafyet-jamil.firebaseapp.com",
    projectId: "shafyet-jamil",
    storageBucket: "shafyet-jamil.firebasestorage.app",
    messagingSenderId: "89945051675",
    appId: "1:89945051675:web:22361ac0295106bd825ebe",
    measurementId: "G-QFQR4ZFT0T"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
export const ADMIN_EMAILS = ["shafayetjamil000@gmail.com"];

// Only for local testing with the Firebase Emulator Suite. Leave as null.
export const EMULATOR = null;
