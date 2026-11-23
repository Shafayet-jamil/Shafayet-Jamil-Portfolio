# ✍️ Writing posts on the website — one-time setup

The blog has a **Write** page (`/write.html`) and a **Review** page (`/review.html`).

- **You** sign in with Google and click **Publish**. The post goes live immediately.
- **Anyone else** signs in with Google and clicks **Submit for review**. Their post stays hidden until you publish it on the Review page. You can also reject it with a note, and they can then fix it and resubmit.
- Your old way still works too: Markdown files in `portfolio/posts/` and `posts.json` keep showing on the blog.

The posts are stored in **Firebase** (free plan). Until you finish the steps below, the Write page says "Writing isn't switched on yet" and the rest of the blog works as before.

Takes about 10 minutes.

---

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> and sign in with your Google account.
2. Click **Create a project** (or **Add project**), name it e.g. `shafayet-portfolio`, and continue. Google Analytics is optional; you can turn it off.

## 2. Register the website and copy its config

1. In the project, click the **⚙️ gear → Project settings**.
2. Under **Your apps**, click the **Web** icon `</>`, give it a nickname (e.g. `portfolio`), and click **Register app**. Do *not* tick "Firebase Hosting".
3. You'll see a `firebaseConfig = { ... }` block. Copy the values into
   **`portfolio/js/firebase-config.js`**, replacing the empty strings:

   ```js
   export const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "shafayet-portfolio.firebaseapp.com",
     projectId: "shafayet-portfolio",
     storageBucket: "shafayet-portfolio.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123",
   };
   ```

   These values are meant to be public. Every Firebase website sends them to the browser. What protects your data is the security rules in step 4.

## 3. Turn on Google sign-in

1. Left menu: **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Google** → **Enable** → choose your support email → **Save**.
3. **Settings** tab → **Authorized domains** → **Add domain**, and add:
   - `shafayet-jamil-portfolio.vercel.app`
   - `shafayet-jamil.github.io` (only if you use GitHub Pages)

## 4. Create the database and paste the security rules

1. Left menu: **Build → Firestore Database → Create database**.
2. Pick a location close to you (e.g. `asia-south1 (Mumbai)`), then choose **Start in production mode**.
3. Open the **Rules** tab, delete what's there, paste the whole content of **`firestore.rules`** (in the repository root), and click **Publish**.

## 5. Check the admin email

The admin (the one who can publish and review) is set in **two** places. Both say
`shafayetjamil000@gmail.com`. If you sign in to Google with a different address, change it in both:

- `portfolio/js/firebase-config.js` → `ADMIN_EMAILS`
- `firestore.rules` → the `isAdmin()` function. After changing it, paste the rules into Firebase again and click **Publish**.

## 6. Deploy and test

1. Commit and push to `main`. Vercel deploys automatically.
2. Open `https://shafayet-jamil-portfolio.vercel.app/write.html`, sign in, write a short test post, and click **Publish**.
3. It should appear on the blog and on the home page. Delete it from the **Review → Published** tab when you're done.

---

## Everyday use

| You want to… | Go to |
|---|---|
| Write and publish your own post | `/write.html` → **Publish** |
| See posts waiting for review | `/write.html` → **Review posts**, or `/review.html` |
| Approve a post | Review page → **Read** → **Publish** |
| Send a post back | **Reject**, then type a note (the author sees it) |
| Take a post down | **Published** tab → **Unpublish** |
| Fix typos in anyone's post | **Edit** |

People who write for the blog see their own posts under **My posts** on the Write page, with the status: *Waiting for review*, *Published* or *Changes requested*.

## Good to know

- **Images:** posts can include images by link, e.g. `![photo](https://...)`. There's no image upload (Firebase Storage needs a paid plan for new projects).
- **Safety:** HTML and scripts inside posts are removed before display, so nobody can inject code into your site. The database rules enforce the review step even if someone skips the website.
- **Cost:** the free Spark plan allows 50,000 reads and 20,000 writes per day, which is far more than a personal blog needs.
- **No email alerts:** you aren't notified about new submissions. Check the Review page; the Write page shows how many posts are waiting.
