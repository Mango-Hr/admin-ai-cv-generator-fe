# AI CV Generator — Frontend

> Your experience, skills, & story. Perfectly formatted.

A modern web application that allows clients to submit CV/resume information, communicate through an integrated chat, and receive professionally formatted documents — all without creating an account.

---

## 🚀 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19.x |
| **Build Tool** | Vite | 8.x |
| **Routing** | React Router DOM | 7.x |
| **Icons** | Lucide React | latest |
| **Animations** | Framer Motion | latest |
| **Styling** | Vanilla CSS (design system) | — |
| **Fonts** | Inter (Google Fonts) | Variable |

---

## 📦 Installed Dependencies

### Production
```
react                  ^19.2.8      Core UI library
react-dom              ^19.2.8      React DOM renderer
react-router-dom       ^7.x         Client-side routing
lucide-react           latest       Icon system (200+ icons)
framer-motion          latest       Scroll animations, transitions, accordion
```

### Dev
```
vite                   ^8.2.0       Build tool & dev server
@vitejs/plugin-react   ^6.0.4       React Fast Refresh
eslint                 ^10.8.0      Code linting
eslint-plugin-react-hooks    ^7.x   React hooks rules
eslint-plugin-react-refresh  ^0.5.x React Refresh linting
```

---

## 🏗️ Project Structure

```
ai_cv-generator/
├── index.html                          # Entry HTML (SEO meta, Google Fonts)
├── public/
│   └── favicon.svg                     # Custom document + checkmark favicon
├── src/
│   ├── main.jsx                        # React root mount
│   ├── App.jsx                         # Router setup
│   ├── App.css                         # App-level overrides (currently minimal)
│   ├── index.css                       # 🎨 Global Design System
│   │                                   #    CSS custom properties, reset, utilities
│   ├── assets/                         # Static assets
│   ├── pages/
│   │   └── LandingPage.jsx             # ✅ Landing page (assembles all sections)
│   └── components/
│       ├── Header/
│       │   ├── Header.jsx              # ✅ Sticky nav, mobile hamburger menu
│       │   └── Header.css
│       ├── Hero/
│       │   ├── Hero.jsx                # ✅ Headline, CTAs, browser mockup visual
│       │   └── Hero.css
│       ├── Features/
│       │   ├── Features.jsx            # ✅ 6 feature cards (3×2 grid)
│       │   └── Features.css
│       ├── HowItWorks/
│       │   ├── HowItWorks.jsx          # ✅ 4-step process flow
│       │   └── HowItWorks.css
│       ├── FAQ/
│       │   ├── FAQ.jsx                 # ✅ 7-item accordion
│       │   └── FAQ.css
│       ├── CTABanner/
│       │   ├── CTABanner.jsx           # ✅ Dark CTA card with glow effects
│       │   └── CTABanner.css
│       └── Footer/
│           ├── Footer.jsx              # ✅ Multi-column footer with links
│           └── Footer.css
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## 🖥️ Landing Page Features (Completed)

### Header
- Sticky navigation with blur backdrop
- Scroll-detection border/shadow on scroll
- Logo with document icon
- Navigation links: Features, Templates, How it works, FAQ
- Chat button & "Build your CV" CTA
- Fully responsive mobile hamburger menu with overlay

### Hero Section
- Large headline with inline colored icons (document, sparkles, template)
- Descriptive subtitle
- Dual CTAs: "Build your CV" (primary) / "See how it works" (outline)
- Trust badges: No signup required · Free to use · PDF, Word & LaTeX export
- Animated browser mockup showing 3-panel CV builder preview (form → CV → output)
- Sparkle decoration animations
- Subtle background grid pattern
- Scroll-triggered entrance animations (framer-motion)

### Features Section
- Section label pill badge
- Responsive 3-column grid (→ 2-col → 1-col)
- 6 feature cards with colored icons and hover effects
  - AI-Powered Content (orange)
  - Fixed Templates (blue)
  - Multi-Format Export (purple)
  - Built-in Chat (teal)
  - No Account Needed (pink)
  - Fast Turnaround (orange)
- Colored top border reveal on hover
- Card lift and shadow on hover
- Staggered scroll-triggered animations

### How It Works
- 4-step horizontal flow: Submit → AI → Review → Download
- Step numbering (01–04) with icons
- Connector arrows between steps on desktop
- Icon background inversion on hover
- Scroll-triggered staggered animation

### FAQ
- 7 questions with accordion expand/collapse
- Smooth height animation with framer-motion AnimatePresence
- Chevron rotation indicator
- First item open by default

### CTA Banner
- Dark rounded card with white inverted button
- Purple and blue decorative gradient glows
- Scroll-triggered entrance animation

### Footer
- Logo + brand tagline
- 3 link columns: Product, Company, Legal
- Copyright bar with dynamic year
- Responsive column wrapping

---

## 📐 Design System (index.css)

The design system uses CSS custom properties for consistency:

### Colors
- `--color-bg` / `--color-bg-secondary` / `--color-bg-tertiary`
- `--color-text-primary` / `--color-text-secondary` / `--color-text-tertiary`
- `--color-border` / `--color-border-light`
- Accent decorations: `--color-deco-orange`, `--color-deco-blue`, `--color-deco-purple`, `--color-deco-pink`, `--color-deco-teal`

### Typography
- Font: Inter (Google Fonts, variable weight)
- Size scale: `--text-xs` (0.75rem) → `--text-7xl` (4.5rem)
- Line heights: `--leading-tight` → `--leading-relaxed`
- Letter spacing: `--tracking-tighter` → `--tracking-wide`

### Spacing
- Scale: `--space-1` (0.25rem) → `--space-32` (8rem)

### Other
- Border radii: `--radius-sm` → `--radius-full`
- Shadows: `--shadow-xs` → `--shadow-xl`
- Transitions: `--transition-fast` (150ms) → `--transition-spring` (500ms)

---

## 🔨 Frontend Pages & Features To Build (Remaining)

### Phase 1 — Client-Facing Pages

| # | Page | Route | Description | Status |
|---|------|-------|-------------|--------|
| 1 | **Landing Page** | `/` | Hero, Features, How it works, FAQ, CTA | ✅ Done |
| 2 | **CV Submission Page** | `/submit` | Multi-step form: personal info, target position, job description, education, work experience, skills, certifications, file uploads | ⬜ TODO |
| 3 | **Submission Success** | `/submit/success` | Confirmation page with submission ID, next steps, chat link | ⬜ TODO |
| 4 | **Client Chat Page** | `/chat/:submissionId` | Real-time conversation window with admin/team, message bubbles, timestamps, file attachments | ⬜ TODO |
| 5 | **CV Download Page** | `/download/:submissionId` | View completed CV preview, download PDF/Word/LaTeX | ⬜ TODO |

### Phase 2 — Authentication & Admin

| # | Page | Route | Description | Status |
|---|------|-------|-------------|--------|
| 6 | **Login Page** | `/login` | Email/password auth form, admin & sub-admin | ⬜ TODO |
| 7 | **Admin Dashboard** | `/admin` | Metrics overview: new requests, in-progress, completed, active chats | ⬜ TODO |
| 8 | **Submission Details** | `/admin/submissions/:id` | View full client submission data, open chat, assign task | ⬜ TODO |

### Phase 3 — Management & Generation

| # | Page | Route | Description | Status |
|---|------|-------|-------------|--------|
| 9 | **Task Management** | `/admin/tasks` | List of assigned tasks, filter by status, assign to sub-admins | ⬜ TODO |
| 10 | **Staff Management** | `/admin/staff` | Create staff accounts, assign roles (Admin, Sub-admin, Moderator) | ⬜ TODO |
| 11 | **Prompt Management** | `/admin/prompts` | Create, edit, version, activate/deactivate AI master prompt | ⬜ TODO |
| 12 | **CV Generation Page** | `/admin/generate/:id` | Load client data → AI processing → preview → export | ⬜ TODO |
| 13 | **Generated CV Preview** | `/admin/preview/:id` | Full CV preview with PDF/Word/LaTeX download options | ⬜ TODO |

---

## 🧩 Shared Components To Build

| Component | Purpose | Status |
|-----------|---------|--------|
| `Button` | Primary, secondary, outline, ghost, destructive variants | ⬜ TODO |
| `Input` / `Textarea` | Form fields with labels, validation, error states | ⬜ TODO |
| `Select` / `Dropdown` | Custom dropdowns for role selection, filters | ⬜ TODO |
| `FileUpload` | Drag & drop + click upload with preview, type/size validation | ⬜ TODO |
| `Modal` | Confirmation dialogs, previews | ⬜ TODO |
| `Toast` / `Notification` | Success, error, info notifications | ⬜ TODO |
| `Badge` | Status badges (New, In Progress, Completed, etc.) | ⬜ TODO |
| `Avatar` | User/staff avatars | ⬜ TODO |
| `Card` | Reusable card container | ⬜ TODO |
| `Table` | Data tables for admin views | ⬜ TODO |
| `Tabs` | Tab navigation for multi-section views | ⬜ TODO |
| `Sidebar` | Admin panel sidebar navigation | ⬜ TODO |
| `ChatBubble` | Message bubbles for client ↔ admin chat | ⬜ TODO |
| `ChatInput` | Text input with send button, file attachment | ⬜ TODO |
| `Skeleton` | Loading placeholder skeletons | ⬜ TODO |
| `EmptyState` | Empty list/no-data states | ⬜ TODO |
| `ErrorBoundary` | React error boundary with fallback UI | ⬜ TODO |
| `ProtectedRoute` | Route guard for authenticated pages | ⬜ TODO |
| `RoleGate` | Conditionally render UI by user role | ⬜ TODO |
| `CVPreview` | Rendered CV preview component | ⬜ TODO |

---

## 🔌 Services / API Layer To Build

| Service | File | Purpose |
|---------|------|---------|
| `api.js` | `src/services/api.js` | Axios/fetch instance with base URL, interceptors, error handling |
| `authService.js` | `src/services/authService.js` | Login, logout, token refresh, session management |
| `submissionService.js` | `src/services/submissionService.js` | POST /api/submissions, GET by ID, upload files |
| `chatService.js` | `src/services/chatService.js` | GET/POST messages, polling or WebSocket |
| `taskService.js` | `src/services/taskService.js` | List tasks, assign, update status |
| `staffService.js` | `src/services/staffService.js` | CRUD staff accounts, role management |
| `promptService.js` | `src/services/promptService.js` | CRUD prompts (admin only) |
| `generationService.js` | `src/services/generationService.js` | Trigger generation, poll status, download |
| `documentService.js` | `src/services/documentService.js` | Download PDF/Word/LaTeX |

---

## 🔐 State Management To Build

| Store | Purpose |
|-------|---------|
| `AuthContext` | Current user, role, token, login/logout actions |
| `SubmissionContext` | Active submission data for client flow |
| `ChatContext` | Active conversation state, messages |
| `UIContext` | Theme, sidebar state, mobile menu, toast queue |

---

## 🎯 Key Frontend Requirements

- **No account for clients** — Client flow is public (submit → chat → download)
- **Authentication for admin/staff** — JWT-based login, role-gated routes
- **Master prompt never exposed** — No frontend endpoint or state reveals the AI prompt
- **Strong form validation** — Required fields, email format, file type/size limits
- **Mobile responsive** — All pages must work on mobile
- **Loading states** — Skeleton loaders, spinners for async operations
- **Error states** — User-friendly error messages, retry options
- **Empty states** — Meaningful empty screens (no submissions yet, no tasks, etc.)

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

The dev server runs at `http://localhost:5173` by default.

---

## 📁 Additional Dependencies Needed (Future)

When building remaining features, these packages will be needed:

```bash
# Form handling & validation
npm install react-hook-form zod @hookform/resolvers

# HTTP client
npm install axios

# Date formatting
npm install date-fns

# PDF preview (if embedding PDF preview in-browser)
npm install @react-pdf/renderer

# Rich text editing (if admin needs to edit CV content)
npm install @tiptap/react @tiptap/starter-kit

# File upload with drag & drop
npm install react-dropzone
```

---

## 📌 Architecture Notes

1. **AI pipeline**: Client Data → OpenAI API → Structured JSON → Fixed Template → PDF/Word
2. **Template-first**: The AI generates content, not layout. Templates handle formatting.
3. **Chat is mandatory**: Every submission auto-creates a conversation.
4. **Prompt security**: The master prompt is admin-only, never exposed via any client endpoint.
5. **Role hierarchy**: Super Admin → Admin → Sub-admin → Moderator

---

## License

Private — All rights reserved.
