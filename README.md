# 📁 Shafayet Jamil — Portfolio

Your personal portfolio website. Clean, minimal, and easy to maintain.

---

## 🗂️ File Structure

```
portfolio/
├── index.html          ← Home page
├── projects.html       ← Projects page
├── blog.html           ← Blog listing page
├── about.html          ← About me page
├── post.html           ← Single post reader (don't edit this)
│
├── posts/
│   ├── posts.json      ← List of ALL your blog posts (edit this!)
│   ├── hello-world.md  ← Sample blog post
│   ├── css-flexbox-guide.md
│   └── cs-journey.md
│
├── assets/
│   └── resume.pdf      ← Put your resume PDF here!
│
└── README.md           ← This file
```

---

## 🚀 How to Run Locally

**You CANNOT just double-click index.html** — the blog system needs a local server to load `.json` and `.md` files.

**The easiest way:**
1. Install [VS Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension (search in Extensions tab)
3. Right-click `index.html` → click **"Open with Live Server"**
4. Done! Your site opens at `http://127.0.0.1:5500`

---

## ✏️ How to Edit Things

### 🔗 Update your social links
Search for `YOUR_USERNAME` and `your@email.com` in every `.html` file and replace them with your real links.

### 📄 Add your resume
Put your resume PDF file in the `assets/` folder and name it `resume.pdf`.

---

## 📝 How to Write a New Blog Post

### Step 1 — Create the Markdown file
Create a new file in the `posts/` folder.

Name it something like `my-new-post.md` (use hyphens, no spaces, all lowercase).

Write your post using Markdown:
```markdown
# Your Post Title

Your first paragraph here...

## A Section Heading

More content here.

- Bullet point 1
- Bullet point 2

**Bold text** and *italic text* work too.
```

### Step 2 — Register it in posts.json
Open `posts/posts.json` and add your post at the TOP of the list (most recent first):

```json
[
  {
    "slug": "my-new-post",
    "title": "My New Post Title",
    "date": "Jan 20, 2026",
    "excerpt": "A short 1-2 sentence summary that shows on the blog listing page.",
    "tags": ["Web Dev", "Personal"]
  },
  ... (your existing posts below)
]
```

⚠️ The `"slug"` must exactly match your `.md` filename (without the `.md`).

That's it! Your post will appear on the blog page automatically.

---

## 🎨 How to Change Colors

Open any `.html` file and find this section at the top:

The main colors used are:
- `#F5F4EF` — light background (warm off-white)
- `#141412` — dark background
- `#C2533A` — accent color (burnt orange/red)

To change the accent color, do a Find & Replace (`Ctrl+H`) and replace `#C2533A` with your preferred color across all files.

---

## 🧩 How to Add a Project

Open `projects.html`, find the comment that says `---- ADD NEW PROJECT HERE ----`, and follow the instructions in that comment.

---

## 🌍 How to Deploy (Put it Online for Free)

### Option 1: GitHub Pages (recommended)
1. Create a GitHub account
2. Create a new repository
3. Upload all your portfolio files
4. Go to Settings → Pages → set source to main branch
5. Your site goes live at `https://YOUR_USERNAME.github.io/REPO_NAME`

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your portfolio folder
3. Get a live URL instantly

---

## ❓ Common Questions

**Q: Why don't the blog posts load when I open the HTML file directly?**
A: Blog posts use `fetch()` which requires a server. Use VS Code Live Server (see above).

**Q: Can I add more pages?**
A: Yes! Copy any existing `.html` file, rename it, and update the nav links in all pages.

**Q: The fonts look different on my computer?**
A: You need internet for Google Fonts to load. They'll look perfect online.

---

Built with HTML, Tailwind CSS, and vanilla JavaScript. No frameworks, no npm, no build tools. 🎉
