# AI CV Generator — Frontend Implementation Plan

> **Phase 1: Frontend-Only Development (10 Working Days)**  
> Building all UI/UX with mock data and API service layer ready for backend integration

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [UI Design Principles](#ui-design-principles)
3. [Project Phases](#project-phases)
4. [Component Architecture](#component-architecture)
5. [Admin & Sub-Admin Dashboard Design](#admin--sub-admin-dashboard-design)
6. [Daily Task Breakdown](#daily-task-breakdown)
7. [Mock Data Strategy](#mock-data-strategy)
8. [API Service Layer](#api-service-layer)
9. [State Management](#state-management)
10. [Quality Checklist](#quality-checklist)

---

## 🎯 Overview

### What We're Building (Frontend Only)

**Client Flow (No Login Required)**
```
Landing Page → CV Submission Form → Success Page → Client Chat → Download CV
```

**Admin Flow (Authenticated)**
```
Login → Dashboard → View Submissions → Assign Tasks → Generate CV → Download
```

**Sub-Admin Flow (Authenticated, Limited Access)**
```
Login → Dashboard (Assigned Tasks Only) → Process CV → Chat with Client → Mark Complete
```

### Key Constraints

✅ **Frontend only** — All backend calls use mock services  
✅ **Match landing page UI style** — Consistent design system, animations, and component patterns  
✅ **Production-ready UI** — Not prototypes, but pixel-perfect, accessible interfaces  
✅ **API-ready** — Service layer structured so backend integration is just swapping mock → real endpoints

---

## 🎨 UI Design Principles

### Design Language (Inspired by Current Landing Page)

#### Visual Style
- **Clean & Modern** — Minimal decoration, focus on content hierarchy
- **Soft shadows & borders** — Subtle depth with `var(--shadow-sm)` to `var(--shadow-xl)`
- **Rounded corners** — `var(--radius-lg)` for cards, `var(--radius-full)` for buttons
- **Accent color system** — Strategic use of blue, orange, purple, pink, teal for visual interest
- **Browser-like mockups** — Chrome-style windows for preview/generation interfaces

#### Typography
- **Font**: Inter (Variable weight)
- **Hierarchy**: Clear distinction between headings, body, and labels
- **Tight headlines** — `--leading-tight` + `--tracking-tighter` for impact
- **Relaxed body** — `--leading-relaxed` for readability

#### Color System (Already Defined)
```css
Primary Text:     #0f0f12
Secondary Text:   #5a5a6e
Tertiary Text:    #8e8ea0
Background:       #ffffff
Surface:          #fafafa
Border:           #e8e8ec

Decorative Accents:
  Orange:   #f97316
  Blue:     #3b82f6
  Purple:   #a855f7
  Pink:     #ec4899
  Teal:     #14b8a6
```

#### Spacing & Layout
- **Container max-width**: `1200px`
- **Consistent spacing scale**: `var(--space-1)` through `var(--space-32)`
- **Grid-based layouts**: 3-column grids for cards, 2-column for details
- **Mobile-first responsive**: Collapse to single column at `768px`

#### Interactive Elements
- **Hover states**: Subtle lift (`translateY(-2px)`) + shadow increase
- **Transitions**: `var(--transition-fast)` (150ms) for hovers, `var(--transition-base)` (250ms) for state changes
- **Focus states**: Visible outline for keyboard navigation
- **Loading states**: Skeleton loaders matching content shape

#### Animation Philosophy
- **Scroll-triggered**: Fade up + stagger using framer-motion
- **Entrance delays**: 0.12s stagger between elements
- **Spring curves**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for playful bounce
- **Sparkle decorations**: Floating animations for AI-related features

---

## 📦 Project Phases

### Phase 1: Foundation & Shared Components (Days 1-2)
Build reusable UI components matching the landing page style

### Phase 2: Client Pages (Days 3-4)
Public-facing pages (no authentication)

### Phase 3: Authentication & Admin Core (Days 5-6)
Login system and admin dashboard foundation

### Phase 4: Admin Features (Days 7-8)
Task management, staff management, CV generation

### Phase 5: Polish & QA (Days 9-10)
Responsive testing, accessibility, loading states, empty states

---

## 🏗️ Component Architecture

### Shared Components Library

All components follow the landing page design patterns.

#### 1. **Button** (`src/components/shared/Button/`)
```jsx
// Variants matching landing page CTAs
<Button variant="primary">     // Black bg, white text, full rounded
<Button variant="secondary">   // Border, transparent bg
<Button variant="ghost">       // No border, hover bg change
<Button variant="destructive"> // Red accent for delete actions
<Button size="sm|md|lg">
<Button loading={true}>        // Shows spinner, disabled
<Button icon={<Icon />}>       // Icon + text
```

**Visual Style**:
- Primary: Matches `hero__cta-primary` (black bg, pill shape, lift on hover)
- Secondary: Matches `hero__cta-secondary` (border, transparent)
- Ghost: Transparent, light hover state
- Icons: 16-18px Lucide icons

#### 2. **Input / Textarea** (`src/components/shared/Input/`)
```jsx
<Input 
  label="Full Name"
  placeholder="John Doe"
  error="This field is required"
  helpText="As it appears on official documents"
/>
```

**Visual Style**:
- Border: `var(--color-border)`
- Focus: Darker border + subtle shadow
- Error state: Red border + error message below
- Labels: `--text-sm`, `--color-text-secondary`, medium weight

#### 3. **Card** (`src/components/shared/Card/`)
```jsx
<Card hover={true} accent="blue">
  <CardHeader>
    <CardIcon color="blue"><Icon /></CardIcon>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

**Visual Style**:
- Matches `features__card` pattern
- White background, subtle border
- Colored top border on hover (like feature cards)
- Optional accent glow for status cards

#### 4. **Badge** (`src/components/shared/Badge/`)
```jsx
<Badge variant="new">New</Badge>
<Badge variant="in-progress">In Progress</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="urgent">Urgent</Badge>
```

**Visual Style**:
- Pill shape (full rounded)
- Color-coded backgrounds (subtle, not harsh)
- Small text (`--text-xs`), medium weight

#### 5. **Modal** (`src/components/shared/Modal/`)
```jsx
<Modal isOpen={true} onClose={handleClose} size="md|lg|xl">
  <ModalHeader>
    <ModalTitle>Title</ModalTitle>
    <ModalClose />
  </ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>
    <Button>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

**Visual Style**:
- Centered overlay with backdrop blur
- White card with rounded corners
- Smooth scale + fade animation (framer-motion)
- Close button (X icon) in top right

#### 6. **FileUpload** (`src/components/shared/FileUpload/`)
```jsx
<FileUpload
  accept=".pdf,.docx"
  maxSize={5} // MB
  multiple={false}
  onUpload={handleUpload}
/>
```

**Visual Style**:
- Dashed border dropzone
- Drag-over state: Blue accent border
- File preview cards with remove button
- Icon + text centered in dropzone

#### 7. **Toast / Notification** (`src/components/shared/Toast/`)
```jsx
<Toast type="success|error|warning|info" message="Success!" />
```

**Visual Style**:
- Slide in from top-right
- Icon + message + close button
- Auto-dismiss after 5s
- Color-coded left border accent

#### 8. **Skeleton Loader** (`src/components/shared/Skeleton/`)
```jsx
<Skeleton width="200px" height="20px" />
<SkeletonCard /> // Pre-built card skeleton
<SkeletonTable rows={5} />
```

**Visual Style**:
- Gray background with shimmer animation
- Matches shape of actual content
- Rounded corners matching design system

#### 9. **Empty State** (`src/components/shared/EmptyState/`)
```jsx
<EmptyState
  icon={<Icon />}
  title="No submissions yet"
  description="New submissions will appear here"
  action={<Button>Create First Submission</Button>}
/>
```

**Visual Style**:
- Centered content with large icon
- Gray text, subtle appearance
- Optional CTA button

#### 10. **Table** (`src/components/shared/Table/`)
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow hover={true}>
      <TableCell>John Doe</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Visual Style**:
- Minimal borders (bottom border only)
- Hover row: Light background
- Sticky header on scroll
- Responsive: Horizontal scroll on mobile

#### 11. **Chat Components** (`src/components/shared/Chat/`)

**ChatBubble**
```jsx
<ChatBubble 
  sender="client|admin" 
  message="Hello!"
  timestamp={new Date()}
  attachment={file}
/>
```

**Visual Style**:
- Client messages: Right-aligned, dark background
- Admin messages: Left-aligned, light gray background
- Rounded corners (more rounded on opposite side)
- Timestamp below in small gray text
- File attachments as clickable cards

**ChatInput**
```jsx
<ChatInput 
  onSend={handleSend}
  onFileAttach={handleAttach}
  placeholder="Type a message..."
/>
```

**Visual Style**:
- Fixed at bottom or in card
- Textarea with auto-expand
- Send button (paper plane icon)
- Attach file button (paperclip icon)
- Subtle border, rounded corners

#### 12. **Sidebar** (`src/components/shared/Sidebar/`)
```jsx
<Sidebar>
  <SidebarHeader>Logo</SidebarHeader>
  <SidebarNav>
    <SidebarLink icon={<Icon />} active={true}>Dashboard</SidebarLink>
  </SidebarNav>
  <SidebarFooter>User menu</SidebarFooter>
</Sidebar>
```

**Visual Style**:
- Fixed left side, full height
- Light gray background (`var(--color-bg-secondary)`)
- Active link: Highlighted with accent color + darker background
- Icons + text labels
- Collapse to icons-only on mobile

#### 13. **Tabs** (`src/components/shared/Tabs/`)
```jsx
<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="chat">Chat</TabsTrigger>
  </TabsList>
  <TabsContent value="details">Content</TabsContent>
</Tabs>
```

**Visual Style**:
- Underline style (not pill background)
- Active tab: Darker text + bottom border
- Smooth transition on switch

---

## 🎛️ Admin & Sub-Admin Dashboard Design

### Design Philosophy

The admin dashboard follows the **same visual language** as the landing page but adapted for data-dense, task-oriented interfaces.

#### Key Differences from Landing Page
- **Sidebar navigation** instead of top header
- **Data tables** instead of feature cards
- **Status badges** and metrics prominently displayed
- **Action buttons** for task management
- **More compact spacing** for information density

---

### Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240px)          Main Content Area                 │
│  ┌──────────────┐        ┌─────────────────────────────┐   │
│  │ Logo         │        │  Dashboard Header           │   │
│  │              │        │  "Welcome back, Admin"      │   │
│  │ Navigation   │        │                             │   │
│  │ • Dashboard  │        │  ┌───────┐ ┌───────┐       │   │
│  │ • Submissions│        │  │Metric │ │Metric │ ...   │   │
│  │ • Tasks      │        │  │ Card  │ │ Card  │       │   │
│  │ • Staff      │        │  └───────┘ └───────┘       │   │
│  │ • Prompts    │        │                             │   │
│  │ • Settings   │        │  Recent Submissions Table   │   │
│  │              │        │  ┌─────────────────────┐   │   │
│  │ [User Menu]  │        │  │ Name │ Status │ ... │   │   │
│  └──────────────┘        │  └─────────────────────┘   │   │
│                          └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Page-by-Page Design

#### 1. **Admin Dashboard** (`/admin`)

**Layout**:
```jsx
<AdminLayout>
  <DashboardHeader greeting="Welcome back, Admin" />
  
  <MetricsGrid>
    <MetricCard 
      title="New Requests" 
      value={12} 
      icon={<FileText />}
      color="blue"
      trend="+3 today"
    />
    <MetricCard 
      title="In Progress" 
      value={8} 
      icon={<Clock />}
      color="orange"
    />
    <MetricCard 
      title="Completed" 
      value={35} 
      icon={<CheckCircle />}
      color="green"
    />
    <MetricCard 
      title="Active Chats" 
      value={6} 
      icon={<MessageCircle />}
      color="purple"
    />
  </MetricsGrid>

  <SectionTitle>Recent Submissions</SectionTitle>
  <SubmissionsTable 
    data={recentSubmissions}
    actions={['view', 'assign', 'chat']}
  />

  <SectionTitle>Quick Actions</SectionTitle>
  <QuickActionsGrid>
    <ActionCard icon={<Users />} title="Manage Staff" link="/admin/staff" />
    <ActionCard icon={<FileEdit />} title="Edit Prompts" link="/admin/prompts" />
  </QuickActionsGrid>
</AdminLayout>
```

**Visual Style**:
- **Metric Cards**: Similar to feature cards but with large numbers
  - Icon in colored circle (top left)
  - Large value (2-3rem font)
  - Label below in gray text
  - Trend indicator ("+3 today" in small green text)
  - Hover: Slight lift
- **Table**: Clean rows with hover state
  - Avatar + name in first column
  - Status badge (colored pill)
  - Action buttons (icon buttons) on right
- **Quick Actions**: 2-column grid of clickable cards

---

#### 2. **Submissions Page** (`/admin/submissions`)

**Layout**:
```jsx
<AdminLayout>
  <PageHeader 
    title="All Submissions" 
    action={<Button>Export CSV</Button>}
  />

  <FiltersBar>
    <SearchInput placeholder="Search by name or email..." />
    <Select options={['All', 'New', 'In Progress', 'Completed']} />
    <Select options={['All Admins', 'Unassigned', 'Me']} />
  </FiltersBar>

  <SubmissionsTable 
    columns={['Client', 'Position', 'Status', 'Assigned To', 'Date', 'Actions']}
    data={submissions}
    sortable={true}
    pagination={true}
  />
</AdminLayout>
```

**Visual Style**:
- **Filters Bar**: Horizontal row of inputs/dropdowns with subtle background
- **Table**: 
  - Avatar + name + email in "Client" column
  - Colored status badges
  - Staff avatar in "Assigned To" column
  - Action dropdown (three dots menu)
- **Pagination**: Bottom of table, simple prev/next + page numbers

---

#### 3. **Submission Detail Page** (`/admin/submissions/:id`)

**Layout**:
```jsx
<AdminLayout>
  <PageHeader 
    title="Submission Detail"
    breadcrumb={['Submissions', 'John Doe']}
    action={<Button icon={<Trash />} variant="destructive">Delete</Button>}
  />

  <TwoColumnLayout>
    <MainColumn>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="chat">Chat (3 new)</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardBody>
              <InfoGrid>
                <InfoItem label="Full Name" value="John Doe" />
                <InfoItem label="Email" value="john@example.com" />
                <InfoItem label="Phone" value="+1 234 567 8900" />
                <InfoItem label="Location" value="New York, NY" />
              </InfoGrid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Position</CardTitle>
            </CardHeader>
            <CardBody>
              <InfoItem label="Position" value="Senior Product Manager" />
              <InfoItem label="Job Description" value="..." multiline />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardBody>
              <ExperienceList items={experiences} />
            </CardBody>
          </Card>

          {/* Education, Skills, etc. */}
        </TabsContent>

        <TabsContent value="chat">
          <ChatWidget submissionId={id} />
        </TabsContent>

        <TabsContent value="files">
          <FilesList files={uploadedFiles} />
        </TabsContent>

        <TabsContent value="history">
          <Timeline events={historyEvents} />
        </TabsContent>
      </Tabs>
    </MainColumn>

    <Sidebar>
      <Card>
        <CardHeader>
          <CardTitle>Status & Assignment</CardTitle>
        </CardHeader>
        <CardBody>
          <StatusBadge status="new" />
          <Divider />
          <Label>Assigned To</Label>
          <StaffSelect 
            value={assignedTo}
            onChange={handleAssign}
            options={staffList}
          />
          <Button variant="primary" fullWidth>
            Assign Task
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <Button icon={<Sparkles />} fullWidth>Generate CV</Button>
          <Button icon={<MessageCircle />} fullWidth variant="secondary">
            Open Chat
          </Button>
          <Button icon={<Download />} fullWidth variant="secondary">
            Download Files
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardBody>
          <InfoItem label="Submitted" value="2 days ago" />
          <InfoItem label="Last Updated" value="1 hour ago" />
          <InfoItem label="Submission ID" value="#CV-1234" copy />
        </CardBody>
      </Card>
    </Sidebar>
  </TwoColumnLayout>
</AdminLayout>
```

**Visual Style**:
- **Two-column layout**: 70% main content, 30% sidebar
- **Tabs**: Underline style, active tab highlighted
- **Info Grid**: 2-column grid of label-value pairs
  - Label: Small gray text above
  - Value: Larger black text, selectable
- **Sidebar cards**: Stacked vertically with spacing
- **Copy button**: Small icon next to copiable values

---

#### 4. **Task Management** (`/admin/tasks`)

**Layout**:
```jsx
<AdminLayout>
  <PageHeader title="Task Management" />

  <TaskBoard>
    <TaskColumn title="Unassigned" count={5}>
      <TaskCard 
        client="John Doe"
        position="Product Manager"
        submittedDate="2 days ago"
        urgent={false}
        onAssign={handleAssign}
      />
      {/* More task cards */}
    </TaskColumn>

    <TaskColumn title="In Progress" count={8}>
      <TaskCard 
        client="Jane Smith"
        position="Software Engineer"
        assignedTo="Michael Brown"
        avatar={avatarUrl}
        progress={60}
      />
      {/* More task cards */}
    </TaskColumn>

    <TaskColumn title="Review" count={3}>
      {/* Task cards */}
    </TaskColumn>

    <TaskColumn title="Completed" count={12}>
      {/* Task cards */}
    </TaskColumn>
  </TaskBoard>
</AdminLayout>
```

**Visual Style**:
- **Kanban-style board**: 4 columns (Unassigned, In Progress, Review, Completed)
- **Column headers**: Title + count badge
- **Task cards**: 
  - Client name (bold)
  - Position (gray text)
  - Date/time info
  - Assigned staff avatar (if assigned)
  - Progress bar (if in progress)
  - Urgent badge (if urgent)
  - Quick action buttons on hover
- **Drag & drop** (visual only, works with clicks in frontend-only mode)

---

#### 5. **Staff Management** (`/admin/staff`)

**Layout**:
```jsx
<AdminLayout>
  <PageHeader 
    title="Staff Management" 
    action={<Button icon={<Plus />}>Add Staff Member</Button>}
  />

  <StaffGrid>
    <StaffCard
      name="Michael Brown"
      role="Admin"
      email="michael@company.com"
      avatar={avatarUrl}
      stats={{
        assigned: 5,
        completed: 23,
        activeChats: 2
      }}
      actions={['edit', 'deactivate']}
    />
    {/* More staff cards */}
  </StaffGrid>
</AdminLayout>
```

**Visual Style**:
- **Grid**: 3 columns → 2 → 1 on mobile
- **Staff Card**:
  - Avatar (large, centered top)
  - Name (bold, below avatar)
  - Role badge (colored pill)
  - Email (small gray text)
  - Stats row (3 small metrics)
  - Action buttons at bottom
  - Hover: Lift effect

**Add/Edit Staff Modal**:
```jsx
<Modal title="Add Staff Member">
  <Input label="Full Name" />
  <Input label="Email" type="email" />
  <Select label="Role" options={['Admin', 'Sub-admin', 'Moderator']} />
  <Input label="Password" type="password" />
  <Toggle label="Send welcome email" />
</Modal>
```

---

#### 6. **Prompt Management** (`/admin/prompts`)

**Layout**:
```jsx
<AdminLayout>
  <PageHeader 
    title="AI Prompt Management" 
    subtitle="⚠️ Only Super Admins can view and edit"
    action={<Button>Create New Version</Button>}
  />

  <PromptVersionsList>
    <PromptVersionCard
      version="v2.3"
      active={true}
      createdBy="Admin"
      createdAt="3 days ago"
      testResults={{ success: 45, failed: 2 }}
      onActivate={handleActivate}
      onEdit={handleEdit}
      onTest={handleTest}
    />
    {/* More versions */}
  </PromptVersionsList>

  <Card>
    <CardHeader>
      <CardTitle>Active Prompt</CardTitle>
      <Badge variant="success">Active</Badge>
    </CardHeader>
    <CardBody>
      <CodeEditor 
        value={promptContent}
        onChange={handlePromptChange}
        language="markdown"
        readOnly={!isSuperAdmin}
      />
    </CardBody>
    <CardFooter>
      <Button variant="secondary">Test Prompt</Button>
      <Button variant="primary">Save Changes</Button>
    </CardFooter>
  </Card>
</AdminLayout>
```

**Visual Style**:
- **Version cards**: Horizontal cards with version number prominent
  - Active indicator (green dot or badge)
  - Metadata (creator, date)
  - Test results (success/fail count)
  - Actions (Activate, Edit, Test, Archive)
- **Code editor**: Monaco or similar, with syntax highlighting
  - Dark theme for code
  - Line numbers
  - Warning banner if user is not super admin

---

#### 7. **CV Generation Page** (`/admin/generate/:id`)

**Layout**:
```jsx
<AdminLayout fullWidth>
  <PageHeader 
    title="Generate CV"
    breadcrumb={['Submissions', 'John Doe', 'Generate']}
  />

  <ThreeColumnLayout>
    <LeftPanel>
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardBody>
          <InfoSummary data={clientData} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
        </CardHeader>
        <CardBody>
          <Select label="Template" options={templates} />
          <Select label="Style" options={['Professional', 'Creative', 'Academic']} />
          <Toggle label="Include photo" />
          <Toggle label="Include references" />
        </CardBody>
      </Card>

      <Button 
        variant="primary" 
        size="lg" 
        fullWidth
        icon={<Sparkles />}
        onClick={handleGenerate}
      >
        Generate CV
      </Button>
    </LeftPanel>

    <CenterPanel>
      {generationStatus === 'idle' && (
        <EmptyState 
          icon={<FileText />}
          title="Ready to Generate"
          description="Click 'Generate CV' to start"
        />
      )}

      {generationStatus === 'loading' && (
        <LoadingState 
          title="Generating CV..."
          subtitle="AI is crafting professional content"
          progress={progress}
        />
      )}

      {generationStatus === 'success' && (
        <CVPreviewPanel>
          <BrowserMockup>
            <CVPreview data={generatedCV} />
          </BrowserMockup>
        </CVPreviewPanel>
      )}
    </CenterPanel>

    <RightPanel>
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardBody>
          <Button icon={<Download />} fullWidth>Download PDF</Button>
          <Button icon={<Download />} fullWidth variant="secondary">
            Download Word
          </Button>
          <Button icon={<Download />} fullWidth variant="secondary">
            Download LaTeX
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation History</CardTitle>
        </CardHeader>
        <CardBody>
          <GenerationHistoryList items={history} />
        </CardBody>
      </Card>
    </RightPanel>
  </ThreeColumnLayout>
</AdminLayout>
```

**Visual Style**:
- **Three panels**: 20% left (inputs), 50% center (preview), 30% right (actions)
- **Browser mockup**: Matches landing page hero mockup style
  - Chrome dots
  - URL bar
  - CV preview inside
- **Loading state**: 
  - Sparkle animation
  - Progress bar
  - Estimated time remaining
- **CV Preview**: Rendered HTML that looks like final document

---

#### 8. **Sub-Admin Dashboard** (`/admin` — Restricted View)

**Key Differences from Admin**:
- ❌ **Cannot see** "All Submissions" — only assigned tasks
- ❌ **Cannot access** Staff Management
- ❌ **Cannot access** Prompt Management
- ✅ **Can see** "My Tasks" dashboard
- ✅ **Can access** assigned submission details
- ✅ **Can chat** with assigned clients
- ✅ **Can generate** CVs for assigned tasks

**Layout**:
```jsx
<AdminLayout>
  <DashboardHeader greeting="Welcome back, Sarah" />

  <MetricsGrid>
    <MetricCard title="My Tasks" value={5} color="blue" />
    <MetricCard title="In Progress" value={3} color="orange" />
    <MetricCard title="Completed Today" value={2} color="green" />
  </MetricsGrid>

  <SectionTitle>My Assigned Tasks</SectionTitle>
  <TasksTable 
    data={myTasks}
    actions={['view', 'chat', 'generate']}
  />
</AdminLayout>
```

**Visual Indicator**:
- Badge in sidebar: "Sub-admin" role badge
- Restricted menu items grayed out with lock icon
- Tooltip on hover: "Admin access required"

---

### Sidebar Navigation Structure

#### Admin (Full Access)
```
Logo
──────────────
📊 Dashboard
📄 Submissions
✓  Tasks
👥 Staff
🤖 Prompts
⚙️  Settings
──────────────
[User Menu]
  • Profile
  • Logout
```

#### Sub-Admin (Limited Access)
```
Logo
──────────────
📊 Dashboard
✓  My Tasks
⚙️  Settings
──────────────
[User Menu]
  • Profile
  • Logout
```

**Visual Style**:
- Active link: Blue left border + blue icon + darker background
- Hover: Subtle background change
- Icons: Lucide React, 20px
- Text: Medium weight, readable size
- Collapsed state: Only icons visible (on narrow screens)

---

## 📅 Daily Task Breakdown

### **Day 1: Foundation & Design System** ✅

**Goals**: Set up shared components matching landing page style

#### Tasks:
1. ✅ Project structure (already exists)
2. ✅ Design system documented (already exists in `index.css`)
3. 🔲 Create shared component files:
   - `Button` (primary, secondary, ghost, destructive variants)
   - `Input` / `Textarea` / `Select`
   - `Card` (header, body, footer)
   - `Badge` (status variants)
   - `Modal` (with animations)

#### Deliverables:
- All shared components created in `src/components/shared/`
- Storybook-style preview page to view all components (optional)
- Components match landing page visual style exactly

---

### **Day 2: More Shared Components**

**Goals**: Complete component library

#### Tasks:
1. 🔲 Create remaining shared components:
   - `FileUpload` (drag & drop)
   - `Toast` / `Notification` system
   - `Skeleton` loaders
   - `EmptyState`
   - `Table` (sortable, paginated)
   - `Avatar`
2. 🔲 Create layout components:
   - `AdminLayout` (with sidebar)
   - `TwoColumnLayout`
   - `ThreeColumnLayout`

#### Deliverables:
- Complete shared component library
- Layout shells ready for page content

---

### **Day 3: Client Submission Flow**

**Goals**: Build public client pages

#### Tasks:
1. 🔲 **CV Submission Page** (`/submit`)
   - Multi-step form UI
   - Steps: Personal Info → Job Target → Experience → Education → Skills → Review
   - Progress indicator
   - File upload for existing CV
   - Form validation (frontend only)
   - Mock API call on submit

2. 🔲 **Submission Success Page** (`/submit/success`)
   - Confirmation message
   - Submission ID display
   - Next steps instructions
   - Link to chat

#### Deliverables:
- Complete submission form with validation
- Success page with clear next steps

---

### **Day 4: Client Chat & Download**

**Goals**: Complete client-facing pages

#### Tasks:
1. 🔲 **Client Chat Page** (`/chat/:submissionId`)
   - Chat layout (shared Chat components)
   - Message history display
   - Message input with file attachment
   - Mock real-time updates (poll every 5s or WebSocket simulation)
   - Typing indicators

2. 🔲 **CV Download Page** (`/download/:submissionId`)
   - CV preview (browser mockup style)
   - Download buttons (PDF, Word, LaTeX)
   - Request corrections button (opens chat)
   - Mock CV data display

#### Deliverables:
- Functional chat interface
- CV preview and download page

---

### **Day 5: Authentication & Admin Core**

**Goals**: Login system and admin dashboard foundation

#### Tasks:
1. 🔲 **Login Page** (`/login`)
   - Email/password form
   - Form validation
   - Error states
   - Mock authentication (stores token in localStorage)
   - Redirect to admin dashboard on success

2. 🔲 **Auth Context & Protected Routes**
   - `AuthContext` provider
   - `ProtectedRoute` component
   - `RoleGate` component (admin vs sub-admin)
   - Token management
   - Auto-logout on invalid token

3. 🔲 **Admin Layout** 
   - Sidebar navigation
   - User menu
   - Page header component
   - Breadcrumbs

#### Deliverables:
- Working login flow (mock)
- Protected admin routes
- Admin layout shell

---

### **Day 6: Admin Dashboard**

**Goals**: Main admin dashboard with metrics and tables

#### Tasks:
1. 🔲 **Admin Dashboard Page** (`/admin`)
   - Metrics cards (New, In Progress, Completed, Active Chats)
   - Recent submissions table
   - Quick actions cards
   - Mock data integration

2. 🔲 **Submissions List Page** (`/admin/submissions`)
   - Data table with filters
   - Search functionality
   - Status filter dropdown
   - Assigned filter dropdown
   - Pagination
   - Row actions (view, assign, delete)

#### Deliverables:
- Complete admin dashboard
- Submissions list with filters

---

### **Day 7: Submission Details & Task Management**

**Goals**: Detailed submission view and task board

#### Tasks:
1. 🔲 **Submission Detail Page** (`/admin/submissions/:id`)
   - Tabs: Details, Chat, Files, History
   - Two-column layout (main + sidebar)
   - Info display components
   - Sidebar: Status, Assignment, Quick Actions, Metadata
   - Mock data for all sections

2. 🔲 **Task Management Page** (`/admin/tasks`)
   - Kanban-style board
   - Four columns: Unassigned, In Progress, Review, Completed
   - Task cards with drag-visual (click to move in frontend-only)
   - Filter by assigned staff

#### Deliverables:
- Detailed submission view with tabs
- Task board interface

---

### **Day 8: Staff, Prompts & CV Generation**

**Goals**: Management pages and CV generation interface

#### Tasks:
1. 🔲 **Staff Management Page** (`/admin/staff`)
   - Staff cards grid
   - Add staff modal
   - Edit staff modal
   - Role assignment
   - Deactivate staff

2. 🔲 **Prompt Management Page** (`/admin/prompts`)
   - Prompt version cards
   - Code editor for active prompt
   - Test prompt functionality (mock)
   - Version history

3. 🔲 **CV Generation Page** (`/admin/generate/:id`)
   - Three-column layout
   - Generation options panel
   - CV preview (browser mockup)
   - Loading state with progress
   - Export buttons

#### Deliverables:
- Staff management interface
- Prompt management interface
- CV generation flow

---

### **Day 9: Polish & Responsive**

**Goals**: Refinement, animations, mobile responsiveness

#### Tasks:
1. 🔲 **Animations**
   - Add framer-motion scroll animations to all pages
   - Loading transitions
   - Modal entrance/exit
   - Toast notifications

2. 🔲 **Responsive Design**
   - Test all pages on mobile (375px, 768px, 1024px)
   - Sidebar collapse on mobile
   - Table horizontal scroll
   - Form layout adjustments
   - Admin dashboard stack vertically

3. 🔲 **Loading & Error States**
   - Skeleton loaders for all data tables
   - Empty states for empty lists
   - Error boundaries
   - Network error handling

#### Deliverables:
- Fully responsive across all breakpoints
- Smooth animations throughout
- All edge cases handled (loading, error, empty)

---

### **Day 10: QA & Final Integration**

**Goals**: Testing, accessibility, final polish

#### Tasks:
1. 🔲 **Quality Assurance**
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile device testing (iOS Safari, Chrome Android)
   - Keyboard navigation testing
   - Screen reader testing (basic)

2. 🔲 **Accessibility**
   - ARIA labels on interactive elements
   - Focus states visible
   - Color contrast checks
   - Alt text on images

3. 🔲 **API Service Layer Finalization**
   - Review all mock services
   - Document expected API contracts
   - Create `API_INTEGRATION_GUIDE.md` for backend team

4. 🔲 **Documentation**
   - Update README with component guide
   - Document all routes
   - Create handoff notes

#### Deliverables:
- Production-ready frontend
- API integration guide
- Handoff documentation

---

## 🧪 Mock Data Strategy

### Mock Services Location
```
src/
  services/
    mock/
      mockAuthService.js        // Login, logout, session
      mockSubmissionService.js  // Submissions CRUD
      mockChatService.js        // Messages, WebSocket simulation
      mockTaskService.js        // Task assignment
      mockStaffService.js       // Staff management
      mockPromptService.js      // Prompt versions
      mockGenerationService.js  // CV generation
      mockData.js               // Seed data (users, submissions, etc.)
```

### Mock Data Structure

#### Users (Admin & Sub-Admin)
```js
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'super_admin',
    avatar: '/avatars/admin.jpg',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'sub_admin',
    avatar: '/avatars/sarah.jpg',
  },
  // More staff
]
```

#### Submissions
```js
const mockSubmissions = [
  {
    id: 'CV-1001',
    client: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      location: 'New York, NY',
    },
    targetPosition: 'Senior Product Manager',
    jobDescription: 'Looking for an experienced PM...',
    experience: [
      {
        company: 'Tech Corp',
        role: 'Product Manager',
        duration: '2020-2023',
        description: 'Led product development...',
      },
    ],
    education: [...],
    skills: ['Product Strategy', 'Agile', 'Stakeholder Management'],
    status: 'new', // new | in_progress | review | completed
    assignedTo: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  // More submissions
]
```

#### Messages
```js
const mockMessages = [
  {
    id: 1,
    submissionId: 'CV-1001',
    senderType: 'client', // client | admin
    senderId: null,
    senderName: 'John Doe',
    message: 'Hello, I have a question about my CV.',
    timestamp: '2024-01-15T11:00:00Z',
    attachment: null,
  },
  // More messages
]
```

### Mock Service Behavior

#### Latency Simulation
All mock services include artificial delay (300-800ms) to simulate network latency.

```js
export const mockDelay = (ms = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));
```

#### Progressive Enhancement
Mock services can transition to real API by:
1. Keeping same function signatures
2. Swapping imports in service layer
3. No changes to components

```js
// services/submissionService.js
import { USE_MOCK } from '../config';
import * as mockService from './mock/mockSubmissionService';
import * as realService from './api/submissionService';

export const submissionService = USE_MOCK ? mockService : realService;
```

---

## 🔌 API Service Layer

### Service Layer Structure

```
src/
  services/
    api.js                    // Axios instance, interceptors
    authService.js            // Login, logout, refresh token
    submissionService.js      // Submission CRUD
    chatService.js            // Messages
    taskService.js            // Task management
    staffService.js           // Staff CRUD
    promptService.js          // Prompt management
    generationService.js      // CV generation
    documentService.js        // Download files
```

### Example Service (submissionService.js)

```js
import api from './api';

export const submissionService = {
  // Get all submissions
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/submissions?${params}`);
    return response.data;
  },

  // Get single submission by ID
  async getById(id) {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  // Create new submission (client)
  async create(data) {
    const response = await api.post('/submissions', data);
    return response.data;
  },

  // Update submission
  async update(id, data) {
    const response = await api.patch(`/submissions/${id}`, data);
    return response.data;
  },

  // Assign submission to staff
  async assign(id, staffId) {
    const response = await api.post(`/submissions/${id}/assign`, { staffId });
    return response.data;
  },

  // Delete submission
  async delete(id) {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },
};
```

### API Documentation for Backend Team

Create `API_INTEGRATION_GUIDE.md` with:
- All endpoint specs (method, path, body, response)
- Authentication requirements
- Error response formats
- Rate limiting expectations
- File upload specifications
- WebSocket/SSE specs for real-time chat

---

## 🗃️ State Management

### Context Providers

#### 1. **AuthContext** (`src/contexts/AuthContext.jsx`)
```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { user, token } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### 2. **ToastContext** (`src/contexts/ToastContext.jsx`)
```jsx
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
```

#### 3. **UIContext** (Optional)
For global UI state (sidebar collapsed, theme, etc.)

---

## ✅ Quality Checklist

### Visual Consistency
- [ ] All components match landing page design system
- [ ] Color usage consistent (accent colors, text colors, backgrounds)
- [ ] Typography consistent (font sizes, weights, line heights)
- [ ] Spacing consistent (padding, margins match spacing scale)
- [ ] Border radii consistent
- [ ] Shadows consistent

### Responsiveness
- [ ] Mobile (375px): Single column, collapsed sidebar, readable text
- [ ] Tablet (768px): Adapted layouts, touch-friendly buttons
- [ ] Desktop (1024px+): Multi-column layouts, sidebar visible
- [ ] Tables: Horizontal scroll on mobile
- [ ] Forms: Full-width inputs on mobile

### Accessibility
- [ ] All buttons have accessible labels
- [ ] All form inputs have associated labels
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for body text)
- [ ] Keyboard navigation works (tab order logical)
- [ ] ARIA labels on icon-only buttons
- [ ] Skip to content link (optional but recommended)

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized and lazy-loaded
- [ ] Code-splitting for routes (React.lazy)
- [ ] Debounced search inputs
- [ ] Virtualized lists for large datasets (optional)

### User Experience
- [ ] Loading states on all async operations
- [ ] Error messages clear and helpful
- [ ] Empty states meaningful and actionable
- [ ] Success feedback (toasts, confirmations)
- [ ] Confirmation dialogs for destructive actions
- [ ] Optimistic UI updates where appropriate

### Code Quality
- [ ] Components modular and reusable
- [ ] Props properly typed (PropTypes or TypeScript)
- [ ] No hardcoded values (use design tokens)
- [ ] Consistent file structure
- [ ] Comments on complex logic
- [ ] No console errors or warnings

---

## 🚀 Getting Started

### Install Additional Dependencies

```bash
# Already installed
npm install react react-dom react-router-dom lucide-react framer-motion

# Add for this phase
npm install axios date-fns react-hook-form zod @hookform/resolvers

# Optional (for code editor in prompt management)
npm install @monaco-editor/react
```

### Environment Setup

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=true
```

### File Structure

```
src/
  components/
    shared/              # All reusable components
      Button/
      Input/
      Card/
      Modal/
      ...
    layout/              # Layout components
      AdminLayout/
      TwoColumnLayout/
      ...
    features/            # Feature-specific components
      submissions/
      tasks/
      chat/
      ...
  pages/
    client/              # Client-facing pages
      LandingPage.jsx
      SubmitCV.jsx
      ChatPage.jsx
      DownloadPage.jsx
    admin/               # Admin pages
      Dashboard.jsx
      Submissions.jsx
      SubmissionDetail.jsx
      Tasks.jsx
      Staff.jsx
      Prompts.jsx
      GenerateCV.jsx
    auth/
      Login.jsx
  services/              # API services
    mock/                # Mock implementations
    api.js
    authService.js
    ...
  contexts/              # React contexts
    AuthContext.jsx
    ToastContext.jsx
  hooks/                 # Custom hooks
    useAuth.js
    useToast.js
    useDebounce.js
  utils/                 # Utility functions
    formatters.js
    validators.js
  config/
    constants.js         # App constants
```

---

## 📝 Notes & Best Practices

### Component Development
1. Start with the smallest components (Button, Input)
2. Build up to composed components (Card, Modal)
3. Create page-specific components last
4. Test each component in isolation before integrating

### Mock Data
- Keep mock data realistic and varied
- Include edge cases (empty states, long text, special characters)
- Simulate loading delays (300-800ms)
- Mock errors occasionally to test error handling

### Git Workflow
- Commit after each component completion
- Use descriptive commit messages: `feat: Add Button component with variants`
- Branch per day: `day-1-foundation`, `day-2-components`, etc.

### Handoff to Backend
- Document all expected API endpoints
- Include example requests/responses
- Specify authentication requirements
- Note any assumptions made

---

## ✨ Success Criteria

### Frontend is complete when:
✅ All pages designed and functional  
✅ All components reusable and styled consistently  
✅ Mock data simulates full user flows  
✅ Responsive across all screen sizes  
✅ Accessible (keyboard nav, ARIA labels, focus states)  
✅ Loading, error, and empty states handled  
✅ API service layer documented for backend integration  
✅ Production build runs without errors

---

**Last Updated**: Ready for development  
**Duration**: 10 working days  
**Team**: Frontend Developer(s)  
**Next Step**: Begin Day 1 tasks when approved

---

🎨 **Remember**: Every component should feel like it belongs with the landing page. Consistency is key!
