// =====================================================================
//  review.html — admin only. Read submitted posts, then publish,
//  reject (with a note for the author), unpublish, edit or delete.
//  firestore.rules blocks everyone else even if they open this page.
// =====================================================================
import { getFirebase, isConfigured, isAdmin, escapeHtml, renderMarkdown, toDate, formatDate, signInWithGoogle } from './blog.js';

const $ = id => document.getElementById(id);
let fb = null;
let currentTab = 'pending';
let posts = [];

function show(section) {
  ['loading', 'notConfigured', 'signedOut', 'notAdmin', 'reviewer'].forEach(id => $(id).classList.toggle('hidden', id !== section));
}

function setTab(tab) {
  currentTab = tab;
  document.querySelectorAll('[data-tab]').forEach(b => {
    const active = b.dataset.tab === tab;
    b.className = `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${active
      ? 'border-[#C2533A] bg-[#C2533A] text-white'
      : 'border-[#E2E1D9] dark:border-[#2A2A27] hover:border-[#C2533A] hover:text-[#C2533A]'}`;
  });
  loadCounts();
  loadPosts();
}

async function loadCounts() {
  const { F, db } = fb;
  for (const status of ['pending', 'published', 'rejected']) {
    try {
      const snap = await F.getDocs(F.query(F.collection(db, 'posts'), F.where('status', '==', status)));
      $(`count-${status}`).textContent = snap.size;
    } catch { $(`count-${status}`).textContent = '?'; }
  }
}

async function loadPosts() {
  const { F, db } = fb;
  const box = $('reviewList');
  box.innerHTML = '<p class="text-sm text-[#888]">Loading…</p>';
  try {
    const snap = await F.getDocs(F.query(F.collection(db, 'posts'), F.where('status', '==', currentTab)));
    posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (toDate(b.updatedAt)?.getTime() || 0) - (toDate(a.updatedAt)?.getTime() || 0));
    render();
  } catch (e) {
    console.error(e);
    box.innerHTML = '<p class="text-sm text-red-600">Posts could not be loaded. Check that firestore.rules has your email as admin.</p>';
  }
}

function render() {
  const box = $('reviewList');
  if (!posts.length) {
    const empty = { pending: 'Nothing waiting for review. 🎉', published: 'No published community posts yet.', rejected: 'No rejected posts.' };
    box.innerHTML = `<p class="text-sm text-[#888] py-8 text-center">${empty[currentTab]}</p>`;
    return;
  }
  const btn = 'px-3 py-1.5 text-xs font-semibold rounded-full transition-colors';
  box.innerHTML = posts.map(p => {
    const when = toDate(p.updatedAt) || toDate(p.createdAt);
    return `
      <article class="p-6 border border-[#E2E1D9] dark:border-[#2A2A27] rounded-2xl bg-white/30 dark:bg-white/5">
        <div class="flex items-center gap-3 mb-3">
          ${p.authorPhoto ? `<img src="${escapeHtml(p.authorPhoto)}" alt="" class="w-8 h-8 rounded-full" referrerpolicy="no-referrer">` : ''}
          <div class="text-sm">
            <span class="font-medium">${escapeHtml(p.authorName || 'Anonymous')}</span>
            <span class="text-[#888]"> · ${when ? formatDate(when) : ''}</span>
          </div>
        </div>
        <h2 class="font-display font-semibold text-xl mb-1">${escapeHtml(p.title)}</h2>
        ${p.excerpt ? `<p class="text-sm text-[#5A5A5A] dark:text-[#AAAAAA] mb-2">${escapeHtml(p.excerpt)}</p>` : ''}
        <div class="flex flex-wrap gap-2 mb-3">
          ${(p.tags || []).map(t => `<span class="px-2 py-0.5 text-xs bg-[#E8E7E0] dark:bg-[#2A2A27] rounded-full">${escapeHtml(t)}</span>`).join('')}
        </div>
        ${p.reviewNote ? `<p class="text-sm text-red-600 dark:text-red-400 mb-3">Your note: ${escapeHtml(p.reviewNote)}</p>` : ''}
        <div id="preview-${p.id}" class="prose hidden border-t border-[#E2E1D9] dark:border-[#2A2A27] pt-5 mt-4 mb-4"></div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button data-action="preview" data-id="${p.id}" class="${btn} border border-[#E2E1D9] dark:border-[#2A2A27] hover:border-[#C2533A] hover:text-[#C2533A]">Read</button>
          ${p.status !== 'published' ? `<button data-action="publish" data-id="${p.id}" class="${btn} bg-emerald-600 text-white hover:bg-emerald-700">Publish</button>` : ''}
          ${p.status === 'pending' ? `<button data-action="reject" data-id="${p.id}" class="${btn} border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Reject</button>` : ''}
          ${p.status === 'published' ? `<button data-action="unpublish" data-id="${p.id}" class="${btn} border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950">Unpublish</button>` : ''}
          <a href="write.html?edit=${encodeURIComponent(p.id)}" class="${btn} border border-[#E2E1D9] dark:border-[#2A2A27] hover:border-[#C2533A] hover:text-[#C2533A]">Edit</a>
          <button data-action="delete" data-id="${p.id}" class="${btn} text-[#888] hover:text-red-600">Delete</button>
        </div>
      </article>`;
  }).join('');
}

async function act(action, id) {
  const p = posts.find(x => x.id === id);
  if (!p) return;
  if (action === 'preview') {
    const el = $(`preview-${id}`);
    if (el.classList.contains('hidden')) el.innerHTML = renderMarkdown(p.content);
    el.classList.toggle('hidden');
    return;
  }
  const { F, db } = fb;
  const ref = F.doc(db, 'posts', id);
  const now = F.serverTimestamp();
  try {
    if (action === 'publish') {
      await F.updateDoc(ref, { status: 'published', publishedAt: p.publishedAt || now, reviewNote: '', updatedAt: now });
    } else if (action === 'reject') {
      const note = prompt('Why is this post rejected? The author will see this note.', '');
      if (note === null) return;
      await F.updateDoc(ref, { status: 'rejected', reviewNote: note.trim().slice(0, 500), updatedAt: now });
    } else if (action === 'unpublish') {
      if (!confirm('Unpublish this post? It moves back to “Pending”.')) return;
      await F.updateDoc(ref, { status: 'pending', updatedAt: now });
    } else if (action === 'delete') {
      if (!confirm('Delete this post permanently?')) return;
      await F.deleteDoc(ref);
    }
    loadCounts();
    loadPosts();
  } catch (e) {
    console.error(e);
    alert('That action failed. Make sure you are signed in with the admin account.');
  }
}

async function init() {
  if (!isConfigured) return show('notConfigured');
  try { fb = await getFirebase(); } catch (e) { console.error(e); return show('notConfigured'); }
  const { auth, A } = fb;
  $('signInBtn').onclick = async () => { $('signInError').textContent = await signInWithGoogle(fb); };
  document.querySelectorAll('.signOutBtn').forEach(b => { b.onclick = () => A.signOut(auth); });
  document.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => setTab(b.dataset.tab); });
  $('reviewList').addEventListener('click', e => {
    const b = e.target.closest('button[data-action]');
    if (b) act(b.dataset.action, b.dataset.id);
  });

  A.onAuthStateChanged(auth, u => {
    if (!u) return show('signedOut');
    if (!isAdmin(u)) { $('notAdminEmail').textContent = u.email || ''; return show('notAdmin'); }
    show('reviewer');
    setTab(currentTab);
  });
}

init();
