// =====================================================================
//  Shared blog code: loads posts from two places and merges them.
//   1. Markdown posts in posts/posts.json (written by hand, as before)
//   2. Posts written on write.html, stored in Firebase Firestore.
//      Only posts with status "published" are visible to the public.
// =====================================================================
import { firebaseConfig, ADMIN_EMAILS, EMULATOR } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let firebasePromise = null;

// Loads the Firebase SDK only when it is configured and needed.
// Resolves to null when Firebase is not set up yet.
export function getFirebase() {
  if (!isConfigured) return Promise.resolve(null);
  if (!firebasePromise) {
    firebasePromise = (async () => {
      const [appMod, authMod, fsMod] = await Promise.all([
        import(`${SDK}/firebase-app.js`),
        import(`${SDK}/firebase-auth.js`),
        import(`${SDK}/firebase-firestore.js`),
      ]);
      const app = appMod.initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      const db = fsMod.getFirestore(app);
      if (EMULATOR) {
        authMod.connectAuthEmulator(auth, `http://${EMULATOR.host}:${EMULATOR.authPort}`, { disableWarnings: true });
        fsMod.connectFirestoreEmulator(db, EMULATOR.host, EMULATOR.firestorePort);
      }
      return { app, auth, db, A: authMod, F: fsMod };
    })();
  }
  return firebasePromise;
}

export function isAdmin(user) {
  if (!user || !user.emailVerified || !user.email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
}

// Escape text before putting it inside HTML (post titles, names, tags...).
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Markdown → safe HTML. DOMPurify removes scripts and other unsafe HTML,
// because posts can come from anyone. Needs marked + DOMPurify on the page.
export function renderMarkdown(markdown) {
  const html = window.marked.parse(markdown || '');
  return window.DOMPurify.sanitize(html);
}

export function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function toDate(timestamp) {
  return timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : null;
}

export function postUrl(post) {
  return post.source === 'md'
    ? `post.html?slug=${encodeURIComponent(post.slug)}`
    : `post.html?id=${encodeURIComponent(post.id)}`;
}

// "All" is already a filter button, so it is not shown as a tag.
export function cleanTags(tags) {
  return (tags || []).filter(t => String(t).toLowerCase() !== 'all');
}

// Markdown posts listed in posts/posts.json
export async function loadMarkdownPosts() {
  const res = await fetch('posts/posts.json');
  if (!res.ok) throw new Error('posts.json not found');
  const list = await res.json();
  return list.map(p => ({ ...p, tags: cleanTags(p.tags), source: 'md', time: Date.parse(p.date) || 0 }));
}

// Published posts from Firestore (empty list when Firebase is not set up)
export async function loadCommunityPosts() {
  const fb = await getFirebase();
  if (!fb) return [];
  const { F, db } = fb;
  const snap = await F.getDocs(F.query(F.collection(db, 'posts'), F.where('status', '==', 'published')));
  return snap.docs.map(d => {
    const x = d.data();
    const when = toDate(x.publishedAt) || toDate(x.createdAt) || new Date();
    return {
      id: d.id, source: 'fb', title: x.title, excerpt: x.excerpt, tags: cleanTags(x.tags),
      authorName: x.authorName, date: formatDate(when), time: when.getTime(),
    };
  });
}

// Both lists merged, newest first. A failure in one source does not hide the other.
export async function loadAllPosts() {
  const [md, fb] = await Promise.allSettled([loadMarkdownPosts(), loadCommunityPosts()]);
  if (md.status === 'rejected' && fb.status === 'rejected') throw md.reason;
  if (fb.status === 'rejected') console.warn('Community posts could not be loaded:', fb.reason);
  const posts = [...(md.value || []), ...(fb.value || [])];
  return posts.sort((a, b) => b.time - a.time);
}
