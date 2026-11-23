// =====================================================================
//  write.html — sign in with Google, write a post, submit it.
//  Guests' posts are saved as "pending" until the admin publishes them.
//  The admin's own posts are published straight away.
// =====================================================================
import { getFirebase, isConfigured, isAdmin, escapeHtml, renderMarkdown, toDate, formatDate } from './blog.js';

const $ = id => document.getElementById(id);
const DRAFT_KEY = 'blogDraft';
const LIMITS = { title: 150, excerpt: 300, content: 100000, tags: 6, tagLength: 30 };

let fb = null;        // Firebase handles from getFirebase()
let user = null;      // signed-in user
let editing = null;   // { id, data } when editing an existing post

// ---------- small helpers ----------
function show(section) {
  ['loading', 'notConfigured', 'signedOut', 'signedIn'].forEach(id => $(id).classList.toggle('hidden', id !== section));
}

function setMsg(html, kind = 'info') {
  const colors = { info: 'text-[#5A5A5A] dark:text-[#AAAAAA]', ok: 'text-emerald-600 dark:text-emerald-400', error: 'text-red-600 dark:text-red-400' };
  $('formMsg').className = `text-sm ${colors[kind]}`;
  $('formMsg').innerHTML = html;
}

function readForm() {
  return {
    title: $('title').value.trim(),
    excerpt: $('excerpt').value.trim(),
    tags: [...new Set($('tags').value.split(',').map(t => t.trim().slice(0, LIMITS.tagLength)).filter(Boolean))].slice(0, LIMITS.tags),
    content: $('content').value,
  };
}

function fillForm(d) {
  $('title').value = d.title || '';
  $('excerpt').value = d.excerpt || '';
  $('tags').value = (d.tags || []).join(', ');
  $('content').value = d.content || '';
}

function statusBadge(status) {
  const map = {
    published: ['● Published', 'text-emerald-600 dark:text-emerald-400'],
    pending: ['◐ Waiting for review', 'text-amber-600 dark:text-amber-400'],
    rejected: ['✕ Changes requested', 'text-red-600 dark:text-red-400'],
  };
  const [text, cls] = map[status] || [status, 'text-[#888]'];
  return `<span class="text-xs font-medium ${cls}">${text}</span>`;
}

// ---------- write / preview tabs ----------
function setTab(tab) {
  const preview = tab === 'preview';
  if (preview) $('preview').innerHTML = renderMarkdown($('content').value) || '<p class="text-[#888]">Nothing to preview yet.</p>';
  $('content').classList.toggle('hidden', preview);
  $('preview').classList.toggle('hidden', !preview);
  document.querySelectorAll('[data-tab]').forEach(b => {
    const active = b.dataset.tab === tab;
    b.className = `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${active
      ? 'border-[#C2533A] bg-[#C2533A] text-white'
      : 'border-[#E2E1D9] dark:border-[#2A2A27] hover:border-[#C2533A] hover:text-[#C2533A]'}`;
  });
}

// ---------- local draft (saved in this browser only, for new posts) ----------
function saveDraft() {
  if (editing) return;
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(readForm())); $('draftNote').textContent = 'Draft saved in this browser.'; } catch { /* storage unavailable */ }
}
function loadDraft() {
  try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if (d) fillForm(d); } catch { /* ignore */ }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  $('draftNote').textContent = '';
}

// ---------- signed-in header ----------
function renderUser() {
  const admin = isAdmin(user);
  $('userName').textContent = user.displayName || user.email || 'Signed in';
  $('userRole').textContent = admin ? 'Admin — your posts are published right away' : 'Your posts are published after review';
  $('userPhoto').src = user.photoURL || '';
  $('userPhoto').classList.toggle('hidden', !user.photoURL);
  $('reviewLink').classList.toggle('hidden', !admin);
  updateSubmitLabel();
}

function updateSubmitLabel() {
  const admin = isAdmin(user);
  $('submitBtn').textContent = editing
    ? (admin ? 'Save changes' : 'Save & send for review')
    : (admin ? 'Publish' : 'Submit for review');
  $('editingBanner').classList.toggle('hidden', !editing);
  if (editing) $('editingTitle').textContent = editing.data.title;
}

async function loadPendingCount() {
  const { F, db } = fb;
  try {
    const snap = await F.getDocs(F.query(F.collection(db, 'posts'), F.where('status', '==', 'pending')));
    $('pendingCount').textContent = snap.size ? `(${snap.size} waiting)` : '';
  } catch { $('pendingCount').textContent = ''; }
}

// ---------- my posts ----------
async function loadMyPosts() {
  const { F, db } = fb;
  const box = $('myPosts');
  box.innerHTML = '<p class="text-sm text-[#888]">Loading…</p>';
  try {
    const snap = await F.getDocs(F.query(F.collection(db, 'posts'), F.where('authorUid', '==', user.uid)));
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (toDate(b.createdAt)?.getTime() || Date.now()) - (toDate(a.createdAt)?.getTime() || Date.now()));
    if (!posts.length) { box.innerHTML = '<p class="text-sm text-[#888]">You haven\'t written any posts yet.</p>'; return; }
    const admin = isAdmin(user);
    box.innerHTML = posts.map((p, i) => {
      const canEdit = admin || p.status !== 'published';
      const when = toDate(p.createdAt);
      return `
        <div class="py-5 ${i < posts.length - 1 ? 'border-b border-[#E2E1D9] dark:border-[#2A2A27]' : ''}">
          <div class="flex flex-wrap items-center gap-3 mb-1">
            ${statusBadge(p.status)}
            <span class="text-xs text-[#888]">${when ? formatDate(when) : 'just now'}</span>
          </div>
          <a href="post.html?id=${encodeURIComponent(p.id)}" class="font-display font-semibold text-lg hover:text-[#C2533A]">${escapeHtml(p.title)}</a>
          ${p.status === 'rejected' && p.reviewNote ? `<p class="text-sm mt-1 text-red-600 dark:text-red-400">Reviewer note: ${escapeHtml(p.reviewNote)}</p>` : ''}
          <div class="flex gap-4 mt-2 text-sm">
            ${canEdit ? `<button data-action="edit" data-id="${p.id}" class="text-[#C2533A] hover:underline">Edit</button>` : ''}
            ${canEdit ? `<button data-action="delete" data-id="${p.id}" class="text-[#888] hover:text-red-600">Delete</button>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    console.error(e);
    box.innerHTML = '<p class="text-sm text-red-600">Your posts could not be loaded.</p>';
  }
}

async function startEdit(id) {
  const { F, db } = fb;
  try {
    const snap = await F.getDoc(F.doc(db, 'posts', id));
    if (!snap.exists()) return setMsg('That post no longer exists.', 'error');
    const data = snap.data();
    if (!isAdmin(user) && data.status === 'published') return setMsg('Published posts can only be edited by the site owner.', 'error');
    editing = { id, data };
    fillForm(data);
    setTab('write');
    updateSubmitLabel();
    setMsg('');
    $('postForm').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    console.error(e);
    setMsg('You can only edit your own posts.', 'error');
  }
}

function stopEdit() {
  editing = null;
  fillForm({});
  loadDraft();
  updateSubmitLabel();
  history.replaceState(null, '', 'write.html');
}

async function deletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  const { F, db } = fb;
  try {
    await F.deleteDoc(F.doc(db, 'posts', id));
    if (editing && editing.id === id) stopEdit();
    loadMyPosts();
  } catch (e) {
    console.error(e);
    alert('This post could not be deleted.');
  }
}

// ---------- submit ----------
async function submitPost(event) {
  event.preventDefault();
  const f = readForm();
  if (!f.title) return setMsg('Please add a title.', 'error');
  if (!f.content.trim()) return setMsg('Please write something in the post.', 'error');
  if (f.content.length > LIMITS.content) return setMsg('The post is too long (100,000 characters max).', 'error');

  const { F, db } = fb;
  const admin = isAdmin(user);
  const now = F.serverTimestamp();
  $('submitBtn').disabled = true;
  setMsg('Saving…');
  try {
    if (editing) {
      const update = { title: f.title, excerpt: f.excerpt, tags: f.tags, content: f.content, updatedAt: now };
      if (!admin) Object.assign(update, { status: 'pending', publishedAt: null });
      await F.updateDoc(F.doc(db, 'posts', editing.id), update);
      const id = editing.id;
      stopEdit();
      setMsg(admin
        ? `Saved. <a class="underline" href="post.html?id=${encodeURIComponent(id)}">View post</a>`
        : 'Saved. Your post is waiting for review again.', 'ok');
    } else {
      const photo = user.photoURL && user.photoURL.length <= 500 ? user.photoURL : '';
      const ref = await F.addDoc(F.collection(db, 'posts'), {
        title: f.title, excerpt: f.excerpt, tags: f.tags, content: f.content,
        authorUid: user.uid,
        authorName: (user.displayName || 'Anonymous').slice(0, 80),
        authorPhoto: photo,
        status: admin ? 'published' : 'pending',
        createdAt: now, updatedAt: now,
        publishedAt: admin ? now : null,
        reviewNote: '',
      });
      clearDraft();
      fillForm({});
      setTab('write');
      setMsg(admin
        ? `Published! <a class="underline" href="post.html?id=${encodeURIComponent(ref.id)}">View post</a>`
        : 'Thanks! Your post was sent for review. Its status is shown under “My posts”.', 'ok');
    }
    loadMyPosts();
    if (admin) loadPendingCount();
  } catch (e) {
    console.error(e);
    setMsg('Could not save the post. Check that the title, summary and tags are not too long, then try again.', 'error');
  } finally {
    $('submitBtn').disabled = false;
  }
}

// ---------- start ----------
async function init() {
  if (!isConfigured) return show('notConfigured');
  try {
    fb = await getFirebase();
  } catch (e) {
    console.error(e);
    $('notConfiguredText').textContent = 'The writing tools could not load. Check your internet connection and refresh the page.';
    return show('notConfigured');
  }
  const { auth, A } = fb;

  $('signInBtn').onclick = async () => {
    $('signInError').textContent = '';
    try { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); }
    catch (e) { if (e.code !== 'auth/popup-closed-by-user') $('signInError').textContent = 'Sign-in failed. Allow pop-ups for this site and try again.'; }
  };
  $('signOutBtn').onclick = () => A.signOut(auth);
  $('postForm').addEventListener('submit', submitPost);
  $('postForm').addEventListener('input', saveDraft);
  $('cancelEdit').onclick = stopEdit;
  document.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => setTab(b.dataset.tab); });
  $('myPosts').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'edit') startEdit(btn.dataset.id);
    if (btn.dataset.action === 'delete') deletePost(btn.dataset.id);
  });
  setTab('write');

  A.onAuthStateChanged(auth, async u => {
    user = u;
    editing = null;
    if (!u) return show('signedOut');
    show('signedIn');
    fillForm({});
    loadDraft();
    renderUser();
    loadMyPosts();
    if (isAdmin(u)) loadPendingCount();
    const editId = new URLSearchParams(location.search).get('edit');
    if (editId) startEdit(editId);
  });
}

init();
