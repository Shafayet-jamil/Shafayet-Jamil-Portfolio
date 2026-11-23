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

export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export const ADMIN_EMAILS = ["shafayetjamil000@gmail.com"];

// Only for local testing with the Firebase Emulator Suite. Leave as null.
export const EMULATOR = null;
