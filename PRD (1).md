# PRD — Project Tracker (Kanban Board)

> Round 2 Web Development Task · Society Recruitment
> Stack: **HTML + CSS for the core, React (via CDN, no build tools) for the interactive bonus**
> Built with: GitHub Copilot
> Guiding rule: **everything in this project must be easy for a beginner to explain**

---

## 1. Overview

**Project Tracker** is a Kanban-style board for tracking personal, college, and freelance projects through four stages: **Backlog → In Progress → Review → Completed**. Each project is a card with a name, a category tag, and notes.

The task is graded in two layers:

1. **Core (HTML + CSS only):** layout, cards, styling, responsiveness, deployment. This is most of the grade.
2. **Bonus (JavaScript):** add, delete, move, edit, search, persistence, stats, drag-and-drop, dark mode, cross-tab sync.

**Strategy:** Finish and deploy the core first. Then add the bonus features in tier order using **React**, committing and redeploying after each tier. The live site must always be in a working state.

## 2. Goals and Non-Goals

### Goals
- A semantic, responsive four-column board that looks like a real product (Trello-style).
- Pass every core requirement before touching JavaScript.
- Reach Tier 3 at least, ideally Tier 4, using React so the logic stays familiar and explainable.
- Code simple enough that every line can be explained from scratch.
- Meaningful, incremental Git history and a live deployment.

### Non-Goals
- No backend, database, or accounts.
- No npm, bundlers, or build step.
- No ES modules, no advanced JavaScript patterns (see Section 3).

## 3. Tech Stack and "Keep It Simple" Rules

| Area | Decision | Why |
|---|---|---|
| Markup | Semantic HTML5 | Required by the task |
| Styling | One `style.css` using CSS variables, Grid/Flexbox, media queries | Required by the task |
| Interactivity | **React 18 loaded from a CDN** with JSX compiled in the browser by Babel Standalone | No install, no build step, closest to what you already know |
| Storage | `localStorage` | Required for Tier 3 |
| Hosting | GitHub Pages | Free, simple |

### How React is loaded (no npm needed)

In `index.html`, before the closing `</body>`:

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script src="data.js"></script>
<script type="text/babel" src="app.js"></script>
```

- `data.js` is plain JavaScript holding the seed data.
- `app.js` holds all React components, written in JSX.
- All files share one global scope, so **there is no `import` or `export` anywhere**.
- Use `React.useState` and `React.useEffect` directly (or one line at the top of `app.js`: `const { useState, useEffect } = React;`).

> Trade-off, stated honestly: compiling JSX in the browser with Babel is slower and not how large production apps are built. For a task of this size it is fine, and it removes all tooling from the picture. If you later want to upgrade, the components move into a Vite project unchanged.

### JavaScript allowed list

Stick to this list. If Copilot suggests anything outside it, ask it to rewrite it more simply.

| Allowed | Notes for you |
|---|---|
| `const`, `let` | Variables. `const` can't be reassigned, `let` can |
| Functions (`function name() {}`) | Prefer this style for helpers |
| Arrow functions, **only inline** in JSX or in `.map` / `.filter` | e.g. `onClick={() => deleteProject(p.id)}` |
| Arrays and objects | The project list is an array of objects |
| `.map()`, `.filter()`, `.find()`, `.concat()` | Loop, remove, look up, add |
| `if / else`, `&&`, ternary `? :` | Conditions in JSX |
| `React.useState`, `React.useEffect` | The only hooks used |
| `localStorage.getItem / setItem`, `JSON.parse / JSON.stringify` | Saving and loading |
| Object spread `{ ...project, status: "Review" }` | Used only to copy an object while changing one field |

| **Not allowed** | Why |
|---|---|
| `import` / `export` (ES modules) | Needs a server and extra concepts |
| `class` components | Hooks only |
| `async` / `await`, `fetch`, Promises | No network, no need |
| `document.querySelector`, `createElement`, `innerHTML` | React handles the DOM; no manual DOM code |
| `reduce`, destructuring in function params, optional chaining, `useReducer`, `useContext`, `useRef` | Extra concepts, not needed |
| Any library (no drag-and-drop libs, no icon libs) | Everything is hand-built |

Two spots technically touch the browser directly, and both are tiny and wrapped in `useEffect`: the cross-tab `storage` event (Tier 4) and setting the theme attribute on `<html>`. Both are explained in Section 9.

## 4. Data Model

Seed data (provided by the task), stored in `data.js`:

```js
var SEED_PROJECTS = [
  { id: 1, project: "Portfolio Website",   category: "Web",      status: "In Progress",
    notes: "Homepage layout done, working on projects section" },
  { id: 2, project: "Poster for Tech Fest", category: "Design",   status: "Backlog",
    notes: "" },
  { id: 3, project: "IoT Weather Station",  category: "Hardware", status: "Review",
    notes: "Sensor calibration pending" }
];

var STATUSES   = ["Backlog", "In Progress", "Review", "Completed"];
var CATEGORIES = ["Web", "Design", "Research", "Hardware", "Other"];
```

| Field | Type | Rules |
|---|---|---|
| `id` | number | Unique. New id = `Date.now()` |
| `project` | string | Required, trimmed, max 60 chars |
| `category` | string | One of `CATEGORIES` |
| `status` | string | One of `STATUSES` |
| `notes` | string | Optional, max 280 chars. Empty shows "No notes yet" |

**localStorage keys:** `projectTracker` (the project array) and `projectTrackerTheme` (`"light"` or `"dark"`).

## 5. Design Specification

### 5.1 Direction
Calm productivity-app look: soft grey page background, white cards, each column with its own accent color, rounded corners, subtle shadows.

### 5.2 CSS Variables

Defined in `:root`, overridden under `[data-theme="dark"]`:

```css
:root {
  --bg: #f4f5f7;
  --surface: #ffffff;
  --text: #1f2937;
  --text-muted: #6b7280;
  --border: #e5e7eb;

  --col-backlog: #64748b;
  --col-progress: #3b82f6;
  --col-review: #f59e0b;
  --col-completed: #10b981;

  --tag-web-bg: #dbeafe;       --tag-web-fg: #1e40af;
  --tag-design-bg: #fce7f3;    --tag-design-fg: #9d174d;
  --tag-research-bg: #dcfce7;  --tag-research-fg: #166534;
  --tag-hardware-bg: #ffedd5;  --tag-hardware-fg: #9a3412;
  --tag-other-bg: #e5e7eb;     --tag-other-fg: #374151;

  --radius: 10px;
  --shadow: 0 1px 3px rgba(0,0,0,.08);
  --shadow-lift: 0 8px 20px rgba(0,0,0,.14);
}
```

### 5.3 Category Colors (required)

| Category | Color |
|---|---|
| Web | Blue |
| Design | Pink |
| Research | Green |
| Hardware | Orange |
| Other | Grey |

### 5.4 Column Distinction
Each column has: a 4px colored top border, a colored dot beside the title, a lightly tinted background, and a count badge.

### 5.5 Card Anatomy

```
┌────────────────────────────┐
│ [Web]                      │  category tag
│ Portfolio Website          │  project name (h3)
│ Homepage layout done, w…   │  notes preview (clamped to 3 lines)
└────────────────────────────┘
```

- Notes clamp: `-webkit-line-clamp: 3`.
- Hover: `transform: translateY(-3px)` plus `--shadow-lift`, with a 150–200ms `transition`.
- Add `@media (prefers-reduced-motion: reduce)` to turn off the motion.

### 5.6 Responsive Breakpoints (mobile-first)

| Width | Layout |
|---|---|
| < 640px | Columns stacked vertically |
| 640px – 1023px | 2 × 2 grid |
| ≥ 1024px | 4 columns side by side (`repeat(4, 1fr)`) |

No horizontal page scroll down to 320px.

## 6. Semantic HTML Structure (Phase 1)

```html
<body>
  <header class="app-header">
    <h1>Project Tracker</h1>
    <p class="tagline">Track every project through every stage</p>
  </header>

  <div id="root">
    <!-- STATIC CORE LIVES HERE. React replaces it when JS runs. -->
    <main class="board" aria-label="Project board">
      <section class="column column--backlog" aria-labelledby="col-backlog">
        <header class="column__header">
          <h2 id="col-backlog">Backlog</h2>
          <span class="column__count">1</span>
        </header>
        <ul class="column__list">
          <li>
            <article class="card">
              <span class="tag tag--design">Design</span>
              <h3 class="card__title">Poster for Tech Fest</h3>
              <p class="card__notes">No notes yet</p>
            </article>
          </li>
        </ul>
      </section>
      <!-- In Progress, Review, Completed -->
    </main>
  </div>
</body>
```

**Why the static markup sits inside `#root`:** the hardcoded cards are the graded core and show up even with JavaScript off. When React starts, it mounts into `#root` and replaces that content with the same board built from data. The same CSS class names are reused in the React version, so styling is written once.

Rules: one `<h1>`; each column is a `<section>` with `aria-labelledby`; cards are `<article>` inside `<li>`; interactive elements are real `<button>` / `<input>` / `<label>`.

## 7. Feature Requirements by Phase

Each phase ends with a commit, a push, and a check of the live site.

### PHASE 0 — Setup
- [ ] Create GitHub repo `project-tracker` with a README stub.
- [ ] Create the files in Section 8.
- [ ] Enable GitHub Pages (Settings → Pages → `main` / root).

**Done when:** a blank `index.html` is live.

### PHASE 1 — Core: HTML + CSS only (REQUIRED, highest priority)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| C1 | Four-column board | Order: Backlog, In Progress, Review, Completed; built with CSS Grid or Flexbox and semantic elements |
| C2 | Hardcoded cards | The 3 seed projects in the correct columns, each with name, category tag, notes preview |
| C3 | Color-coded tags | Web blue, Design pink, Research green, Hardware orange; readable contrast |
| C4 | Column distinction | Each column visibly different; header has title and count |
| C5 | Hover effect | Cards lift with shadow on `:hover` |
| C6 | Responsive | 4 → 2 → 1 columns via media queries; usable at 320px |
| C7 | Empty state | "No projects yet" styled message in empty columns (Completed, in the seed data) |
| C8 | Deployment | Live URL works; link in README |

**Optional polish:** add 2–3 extra hardcoded cards (for example a Research project in Completed) so every column and tag color is shown. The 3 seed cards are mandatory, extras are a bonus.

**Done when:** it looks polished with JavaScript disabled, passes the Section 11 core checklist, and is live.

### PHASE 2 — Tier 1 (Easy): React setup, add, delete, placeholder

First, add the React scripts (Section 3), create `data.js`, and render the board from the seed data using components (Section 9). Then:

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| T1.1 | Add Project form | Fields: name (required), category (select), status (select, default Backlog), notes (textarea). Submitting adds the card to the correct column and clears the form |
| T1.2 | Validation | Empty or whitespace-only name shows an inline error and does not submit |
| T1.3 | Delete card | Delete button on each card with `aria-label="Delete {name}"` |
| T1.4 | Empty placeholder | A column with no cards shows "No projects yet" automatically |
| T1.5 | Live counts | Column count badges update on every change |

### PHASE 3 — Tier 2 (Medium): move, edit, search

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| T2.1 | Move to next stage | "Move to next stage →" advances one column. Hidden (or "Done ✓") on Completed |
| T2.2 | Edit card | Edit opens the same form pre-filled; saving updates name, category, status, notes |
| T2.3 | Search | Input filters by project name, case-insensitive, live as you type. Counts reflect the filter. No results shows "No matches" |
| T2.4 | Clear search | An "×" button empties the search |

Reuse one form for add and edit: a state variable `editingProject` is `null` when adding and holds the project when editing.

### PHASE 4 — Tier 3 (Hard): persistence, stats, drag-and-drop

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| T3.1 | localStorage | Every change is saved. On load, read from storage; if nothing is saved or it is corrupt, use the seed data. Refresh keeps changes |
| T3.2 | Stats summary | Header shows e.g. "5 Backlog · 2 In Progress · 1 Review · 1 Completed" plus total |
| T3.3 | Drag and drop | Drag a card into another column to change its status, using React's `onDragStart`, `onDragOver`, `onDrop` props. Target column highlights while dragging over |
| T3.4 | Button fallback | The Move button keeps working for touch devices and keyboard users |

### PHASE 5 — Tier 4 (Stretch): dark mode, tab sync

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| T4.1 | Dark mode toggle | Button switches theme. Saved in `projectTrackerTheme`. Defaults to the system preference. Tags and columns stay readable |
| T4.2 | Cross-tab sync | A change in one tab shows up in a second open tab via the `storage` event |
| T4.3 | React rebuild | Already satisfied, because the interactive version is built in React. Mention this in the README |

### PHASE 6 — Polish and Docs
- [ ] Accessibility pass (Section 10).
- [ ] README: description, screenshots, live link, features by tier, tech stack, how to run locally.
- [ ] Switch the CDN scripts to the production builds (`react.production.min.js`, `react-dom.production.min.js`) before final deploy.
- [ ] Final check on the live URL on desktop and phone.

## 8. File Structure

```
project-tracker/
├── index.html     # static core markup inside #root + script tags
├── style.css      # all styles, variables, responsive rules
├── data.js        # seed data and constants (plain JS)
├── app.js         # all React components (JSX)
├── README.md
└── PRD.md
```

Only five working files. Open the project locally with the VS Code **Live Server** extension, because Babel loads `app.js` over HTTP and will not work when `index.html` is opened directly from the file system. GitHub Pages is fine.

## 9. React Architecture (Phases 2–5)

### 9.1 Component Tree

```
App
├── Header          (title, stats, search box, dark mode button, "Add project" button)
├── Board
│   └── Column × 4  (title, count, list, "No projects yet")
│       └── Card × n (tag, name, notes, Move / Edit / Delete buttons)
└── ProjectForm     (add and edit; shown only when open)
```

### 9.2 State (all lives in `App`)

| State | Initial value | Purpose |
|---|---|---|
| `projects` | Loaded from localStorage, else `SEED_PROJECTS` | The data |
| `searchText` | `""` | Search filter |
| `isFormOpen` | `false` | Show or hide the form |
| `editingProject` | `null` | Which project is being edited, `null` means adding |
| `theme` | Saved value or system preference | Light or dark |

State is passed down to children as props, and actions are passed down as function props (`onDelete`, `onMove`, `onEdit`). No context or reducers.

### 9.3 Action Functions (in `App`)

| Function | What it does |
|---|---|
| `addProject(data)` | Adds a new object to `projects` using `.concat()` |
| `updateProject(id, data)` | `.map()` over projects and replace the one matching `id` |
| `deleteProject(id)` | `.filter()` out the project matching `id` |
| `moveProject(id, newStatus)` | `.map()` and change `status` for the matching project |
| `nextStatus(status)` | Look up the position in `STATUSES` and return the next one, or `null` if Completed |

Rule: **never edit state in place.** Always produce a new array, then call `setProjects`. This is the one React rule that matters here, and it is easy to explain.

### 9.4 The Only `useEffect`s

| Effect | Runs when | What it does |
|---|---|---|
| Save projects | `projects` changes | `localStorage.setItem("projectTracker", JSON.stringify(projects))` |
| Apply theme | `theme` changes | Sets `document.documentElement.setAttribute("data-theme", theme)` and saves it |
| Tab sync | Once, on load | Adds a `storage` event listener that reloads `projects` from localStorage, and removes it on cleanup |

### 9.5 Loading Safely
`loadProjects()` wraps `JSON.parse` in `try / catch`. If the saved value is missing, corrupt, or not an array, return `SEED_PROJECTS`.

### 9.6 Drag and Drop (React way)
- Card: `draggable="true"`, `onDragStart` stores the project id with `event.dataTransfer.setData("text", id)`.
- Column list: `onDragOver` calls `event.preventDefault()` (required, otherwise dropping is blocked) and sets a "highlight" state. `onDrop` reads the id and calls `moveProject(id, thisColumnStatus)`.

### 9.7 Rendering Lists
Use `.map()` with a unique `key`:

```jsx
{visibleProjects.map(function (p) {
  return <Card key={p.id} project={p} />;
})}
```

## 10. Accessibility and Quality

- AA color contrast for text, tags, and buttons in both themes.
- Tags always include a text label (never color alone).
- Visible `:focus-visible` styles; all buttons have accessible names.
- Form inputs have `<label>`s; validation message uses `aria-live="polite"`.
- Add/Edit form can be closed with the `Esc` key and a Cancel button.
- Stats and counts use `aria-live="polite"`.
- `<html lang="en">`, a meaningful `<title>`, viewport meta tag, simple emoji favicon.
- Keyboard users can add, edit, move, and delete without drag and drop.

## 11. Test Checklist

**Core (JavaScript disabled in dev tools)**
- [ ] 4 columns in the right order, visually distinct
- [ ] Seed cards in the right columns with correct tags and notes
- [ ] Empty notes handled gracefully
- [ ] Hover lift works
- [ ] 1440, 1024, 768, 375, and 320px widths look right with no horizontal scroll
- [ ] HTML validates (validator.w3.org)
- [ ] Live URL matches local

**With React**
- [ ] Board looks identical to the static version on load
- [ ] Add with valid and invalid input
- [ ] Delete; placeholder returns when a column is emptied
- [ ] Move through all stages; Completed has no forward action
- [ ] Edit keeps the same card, updates fields
- [ ] Search is case-insensitive; clearing restores all cards
- [ ] Refresh keeps data
- [ ] Setting localStorage to garbage text does not break the app
- [ ] Drag and drop works between every pair of columns
- [ ] Dark mode persists after refresh
- [ ] Change in one tab appears in another

## 12. Concepts You Must Be Able to Explain

Because you'll be asked about your code, learn these in this order. Each one is small.

| When | Concept | One-line explanation to learn |
|---|---|---|
| Phase 1 | Semantic HTML | Tags that describe meaning (`header`, `main`, `section`, `article`) instead of `div` everywhere |
| Phase 1 | CSS Grid vs Flexbox | Grid for the board's rows/columns, Flexbox for small layouts inside cards |
| Phase 1 | CSS variables | Define a color once, reuse it everywhere, and swap it for dark mode |
| Phase 1 | Media queries | Rules that apply only above or below a screen width |
| Phase 2 | JSX | HTML-looking syntax inside JavaScript |
| Phase 2 | Components and props | Reusable pieces of UI, and the data passed into them |
| Phase 2 | `useState` | Memory a component keeps; changing it re-draws the screen |
| Phase 2 | Controlled inputs | The input's value comes from state, and typing updates state |
| Phase 2 | `.map()` and `key` | Turn an array of data into a list of cards |
| Phase 3 | `.filter()` | Keep only items matching a condition (delete, search) |
| Phase 3 | Immutable updates | Make a new array instead of changing the old one |
| Phase 4 | `useEffect` | Run code after the screen updates (save to localStorage) |
| Phase 4 | localStorage + JSON | Browser storage that only holds text, so convert with `JSON.stringify` / `JSON.parse` |
| Phase 4 | Drag events | Browser events that tell you what is dragged and where it dropped |
| Phase 5 | `data-theme` attribute | One attribute on `<html>` flips all CSS variables |
| Phase 5 | `storage` event | Fires in other tabs when localStorage changes |

## 13. Git and Deployment Plan

Small, frequent commits. Example history:

```
chore: initialize repo with README and files
feat(html): add semantic board skeleton with four columns
feat(css): style columns, cards, and category tags
feat(css): add card hover effect
feat(css): add responsive breakpoints
feat(html): add seed project cards
docs: add README with live link
feat(react): load React from CDN and render board from seed data
feat(react): add project form with validation
feat(react): delete project and empty-column placeholder
feat(react): move to next stage button
feat(react): edit existing project
feat(react): search filter by project name
feat(react): persist board in localStorage
feat(react): add stats summary
feat(react): drag and drop between columns
feat(ui): dark mode toggle
feat(react): sync state across tabs
docs: update README with screenshots and features
```

Tag milestones `v1.0-core` and `v2.0-interactive`. Keep `main` deployable at all times.

## 14. Working With GitHub Copilot

**Put this in `.github/copilot-instructions.md` so Copilot follows your rules:**

```
This is a beginner project. Use only HTML, CSS, and JavaScript with React 18 loaded from a CDN.
No npm, no build tools, no import/export, no ES modules, no classes, no async/await.
Write simple code with short comments explaining each step in plain English.
Use function declarations where possible; arrow functions only inline in JSX or in map/filter.
Use only React.useState and React.useEffect. Never mutate state; create a new array with map, filter, or concat.
Never use document.querySelector, innerHTML, or manual DOM manipulation.
Use the CSS class names and CSS variables already defined in style.css.
```

**Tips**
- Work one requirement ID at a time and commit after each.
- After each suggestion, ask Copilot Chat: "Explain this code line by line as if I'm a beginner."
- If you don't understand a piece of code, ask for a simpler version before accepting it.

**Sample prompts**

| Phase | Prompt |
|---|---|
| 1 | "Create a semantic HTML skeleton for a Kanban board with four `<section>` columns, each with a header (h2 and count badge) and a `<ul>` of `<article class="card">` items." |
| 1 | "Write mobile-first CSS Grid for `.board`: 1 column by default, 2 at 640px, 4 at 1024px." |
| 1 | "Style `.tag` pills with modifiers `tag--web`, `tag--design`, `tag--research`, `tag--hardware`, `tag--other` using the --tag-* CSS variables." |
| 2 | "Create a React `Card` component that takes a `project` prop and shows the category tag, name, and notes, using the existing CSS classes." |
| 2 | "Create a `ProjectForm` component with controlled inputs using `useState`, and a validation message if the name is empty." |
| 3 | "Write `nextStatus(status)` using the STATUSES array that returns the next stage or null if Completed." |
| 3 | "Filter the projects by `searchText` (case-insensitive) before passing them to the Board." |
| 4 | "Write `loadProjects()` that reads `projectTracker` from localStorage inside try/catch and falls back to SEED_PROJECTS." |
| 4 | "Add drag and drop to Card and Column using React props onDragStart, onDragOver, onDrop." |
| 5 | "Add a `useEffect` that listens for the `storage` event and reloads projects, and removes the listener on cleanup." |

## 15. Evaluation Mapping

| Criterion | How this plan addresses it |
|---|---|
| Layout and structure | Semantic skeleton (Section 6), Grid board, works without JS |
| Visual design | CSS variables, column accents, color-coded tags, hover lift, dark mode |
| Responsiveness | Mobile-first 4 / 2 / 1 layout, tested to 320px |
| Code organization | Five files, clear component tree, one state owner, action function table |
| Bonus features | Tiers 1 to 4 in order, all built in React |
| Git usage | Commit-per-requirement plan, milestone tags |
| Deployment | GitHub Pages from Phase 0, redeployed each phase |

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Spending too long on JS before the core is polished | Core is Phase 1 and must be deployed first |
| App doesn't work when `index.html` is double-clicked | Use VS Code Live Server locally |
| Copilot writes ES modules, async code, or manual DOM code | Rules in `copilot-instructions.md`; reject and re-prompt |
| You can't explain a piece of generated code | Ask Copilot to explain; use the concept table in Section 12 |
| Corrupt or stale localStorage breaks the app | try/catch and fallback to seed data |
| Drag and drop poor on touch devices | Keep the Move button |
| In-browser Babel feels slow | Acceptable for this size; use production React builds before final deploy |

## 17. Definition of Done

- [ ] All Phase 1 requirements met and working with JavaScript disabled
- [ ] Live link works and is in the README
- [ ] GitHub repo has full source and meaningful commit history
- [ ] Tiers 1 to 3 complete (Tier 4 if time allows)
- [ ] Accessibility and test checklists pass
- [ ] You can explain every file and every concept in Section 12
