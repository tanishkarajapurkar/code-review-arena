# 🧑‍💻 Code Review Arena
> **Production-Grade Peer Code Review & Quality Platform**  
> Built with **React 18 + Monaco Editor + Node.js + Express + MongoDB**

---

## 🌟 Overview

**Code Review Arena** is a developer platform designed around a **proper peer code-review workflow** rather than generic comment boards. It combines the structured pull-request experience of GitHub, the line-level annotation workflows of enterprise code reviews, and the knowledge-sharing culture of Stack Overflow into a focused, educational arena.

### The Problem It Solves
Most student/portfolio projects are simple CRUD applications (*"upload code → someone leaves a generic comment"*). In real software engineering:
1. Reviews are attached to **precise code lines and ranges**.
2. Comments are categorized (**🐛 Bug, ⚡ Performance, 🔐 Security, 🧹 Quality, 📖 Readability, 💡 Suggestion**).
3. Code versions are **immutable snapshots**.
4. The author and reviewer engage in **revision cycles** (*v1 → Review → v2 → Diff Check → Approval*).
5. Reviewers evaluate against a **Resolution Checklist**, where open blockers must be resolved before final approval.
6. Authors rate review quality (**Correctness, Clarity, Actionability**) to cultivate high-signal reviewer reputations.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Line-Level Comments** | Click any line number or gutter icon in **Monaco Editor** to draft structured feedback anchored to that exact line. |
| **Review Categories** | Structured pills: `🐛 Bug`, `⚡ Performance`, `🔐 Security`, `🧹 Code Quality`, `📖 Readability`, `💡 Suggestion`. |
| **Immutable Version Snapshots** | Authors publish `v2`, `v3` without overwriting historical code. Comments retain context or flag outdated status. |
| **Visual Code Diff Viewer** | Side-by-side or unified diff comparison powered by Monaco Diff Editor (`<DiffEditor />`) across any two revisions. |
| **Resolution Checklist** | Real-time tracking of resolved issues. Enforces blocker resolution before granting **Final Approval ✅**. |
| **Smart Reviewer Matching** | Matches submissions to reviewers based on language proficiencies, category expertise, and active load. |
| **Review Quality Score** | Authors rate reviews on **Correctness ⭐**, **Clarity ⭐**, and **Actionability ⭐** to power reviewer leaderboards. |
| **Reviewer Profiles** | Profile pages showing verified review count, helpful ratios, and expertise breakdowns (Security, Performance, etc.). |
| **Fast Persona Switcher** | 1-click header switcher to test workflows as **Reviewer (Tanishka)**, **Author (Alex)**, **Senior (Sarah)**, or **Admin**. |
| **Notification Center** | Real-time alerts for comments, line replies, revisions, and approval verdicts. |

---

## 📐 Architecture & Data Model

```
                    ┌──────────────────────────┐
                    │       React 18 SPA       │
                    │  (Vite + Tailwind CSS)   │
                    └────────────┬─────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
     Monaco Code Editor                      Monaco Diff Editor
     (Line Glyph Gutter)                     (Split / Unified)
             │                                       │
             └───────────────────┬───────────────────┘
                                 │ REST API (JWT)
                    ┌────────────┴─────────────┐
                    │    Node.js + Express     │
                    └────────────┬─────────────┘
                                 │ Mongoose
                    ┌────────────┴─────────────┐
                    │      MongoDB Engine      │
                    └──────────────────────────┘
```

### MongoDB Collections
* **`users`**: Profiles, credentials, expertise map (security, performance, etc.), and helpful review statistics.
* **`reviews`**: Title, description, language, difficulty, tags, author, status (`waiting`, `under_review`, `changes_requested`, `approved`, `closed`), quality ratings.
* **`code_versions`**: Immutable source code snapshots with version numbers, timestamps, and changelog notes.
* **`comments`**: Line numbers, line ranges, categories, resolution states (`isResolved`), blocker flags, and thread replies.
* **`notifications`**: User alerts for comments, status transitions, and ratings.
* **`review_actions`**: Comprehensive chronological audit trail.

---

## 🎓 Syllabus Alignment

This project satisfies all key academic and industry competencies:

1. **JavaScript & Modern ES6+**:
   - Asynchronous async/await flow and event listeners.
   - Array transformations (`reduce`, `map`, `filter`).
   - Clean modular architecture.
2. **React Fundamentals & Component Architecture**:
   - Component decomposition (`MonacoCodeViewer`, `MonacoDiffViewer`, `CommentThread`, `StatusBadge`).
   - State management and props validation.
3. **Advanced React**:
   - **React Router v6**: Dynamic routes (`/reviews/:id`, `/profile/:username`, `/match`).
   - **Context API**: `AuthContext` with demo role switching.
   - **Hooks**: Custom API abstractions, `useEffect` polling, and optimized rendering.
4. **Node.js & Express**:
   - RESTful routing with authentication middleware (`protect`, `optionalProtect`).
   - Atomic multi-document mutations (Review + CodeVersion snapshot).
   - Validation and error-handling pipelines.
5. **MongoDB & Mongoose**:
   - Relational references with `.populate()` and aggregate pipelines.
   - Immutable historical versioning pattern.

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `127.0.0.1:27017`

### 1. Server Setup
```bash
cd server
npm install
npm run seed     # Seeds realistic demo reviews and personas
npm run dev      # Starts API on http://localhost:5000
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev      # Starts React client on http://localhost:3000
```

Open **`http://localhost:3000`** in your browser to experience the full Code Review Arena workflow!
