# CSS Flexbox: The Guide I Wish I Had

For weeks, flexbox felt like magic I couldn't control. I'd copy code from Stack Overflow, it would sort of work, and I'd move on — never really understanding *why*.

Then one day it clicked. Let me share the mental model that made everything make sense.

## The Main Idea

Think of flexbox like a **parent-child relationship**.

The **parent** (the flex container) controls how its **children** (the flex items) are laid out.

```css
.parent {
  display: flex; /* this turns on flexbox */
}
```

That's it. Just adding `display: flex` to a container makes all its direct children become flex items.

## The Two Axes

This was the thing that unlocked everything for me.

Flexbox has two axes:

1. **Main axis** — the direction items flow (default: left to right)
2. **Cross axis** — perpendicular to the main axis (default: top to bottom)

When you use `flex-direction: row` (the default), the main axis goes **horizontally**.
When you use `flex-direction: column`, the main axis goes **vertically**.

## The Properties You'll Use 90% of the Time

### `justify-content` — aligns items on the **main axis**

```css
.parent {
  display: flex;
  justify-content: center;       /* center items horizontally */
  justify-content: space-between; /* space items out evenly */
  justify-content: flex-end;     /* push items to the right */
}
```

### `align-items` — aligns items on the **cross axis**

```css
.parent {
  display: flex;
  align-items: center;    /* center items vertically */
  align-items: flex-start; /* align to the top */
  align-items: stretch;   /* stretch to fill height (default) */
}
```

### Centering something perfectly

Want to perfectly center a `div` on the page? Here you go:

```css
.parent {
  display: flex;
  justify-content: center; /* horizontal center */
  align-items: center;     /* vertical center */
  height: 100vh;           /* full viewport height */
}
```

This took me way too long to figure out. Hope it saves you time.

## `flex-wrap`

By default, flex items try to fit in one line. If you want them to wrap onto multiple lines:

```css
.parent {
  display: flex;
  flex-wrap: wrap; /* items wrap to next line if needed */
}
```

## The `gap` Property

Instead of using margins between flex items, use `gap`:

```css
.parent {
  display: flex;
  gap: 16px; /* space between all items */
}
```

Clean and simple.

---

## Summary

| Property | What it does |
|---|---|
| `display: flex` | Turns on flexbox |
| `flex-direction` | Sets main axis direction |
| `justify-content` | Aligns on main axis |
| `align-items` | Aligns on cross axis |
| `flex-wrap` | Allows wrapping |
| `gap` | Space between items |

---

That's it. Once I understood axes and the parent-child relationship, everything else was just looking up the right property name.

Go practice — build a navbar with flexbox. Then a card layout. It'll become second nature quickly.

— Shafayet
