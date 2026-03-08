# React + Vite Frontend Implementation Plan

## Overview

Building a modern React + Vite frontend application for OpenLog that connects to the existing Hono backend. The application will feature a dashboard with project and log entry statistics, a log entries management page with advanced filtering, and project creation capabilities. The frontend will use React Context API for state management, Tailwind CSS for styling, and TanStack Query for server state management.

## Current State Analysis

### Backend Structure
- **API Server**: Hono-based REST API running on port 3000
- **Database**: SQLite with existing schema for Projects and LogEntries
- **API Routes**:
  - `GET/POST /api/projects` - Project management
  - `GET/PUT/DELETE /api/projects/:id` - Individual project operations
  - `GET/POST /api/projects/:projectId/entries` - Log entry management
  - `GET/PUT/DELETE /api/projects/:projectId/entries/:entryId` - Individual entry operations
  - `POST /api/projects/:projectId/entries/:entryId/image` - Image upload
  - `GET /health` - Health check endpoint

### API Response Format
All responses follow a consistent wrapper:
```typescript
{
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  } | null;
  timestamp: string;
}
```

### Data Models
**Project**:
- id: string (unique identifier)
- name: string (required, max 255 chars)
- path: string (required)
- description: string | null (optional, max 1000 chars)
- createdAt: ISO 8601 string
- updatedAt: ISO 8601 string

**LogEntry**:
- id: string (unique identifier)
- projectId: string (foreign key)
- content: string (required)
- imagePath: string | null (optional)
- createdAt: ISO 8601 string
- updatedAt: ISO 8601 string

**Pagination**: page, limit, total, totalPages, items

### Entry Filters
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- startDate: ISO 8601 datetime (optional)
- endDate: ISO 8601 datetime (optional)
- keyword: string (optional, searches content)

## Requirements

### Functional Requirements

#### FR-001: Dashboard Page
- Display total number of projects
- Show recent log entries across all projects (last 10 entries)
- Display entry count statistics per project
- Render activity chart showing log entry creation trends (last 7 days)
- Quick action button to create new project

#### FR-002: Projects Management
- Display list of all projects in a table/grid format
- Create new project with name, path, and description
- Edit existing project details
- Delete projects (with confirmation dialog)
- Navigate to project details/entries page

#### FR-003: Log Entries Page
- Display all log entries for a selected project in paginated table
- Support filtering by:
  - Date range (startDate, endDate)
  - Keyword search in content
- Support pagination (page, limit)
- Display entry details: content, creation date, associated image
- Create new log entry with content text
- Edit existing log entry content
- Delete log entries (with confirmation)
- Upload and attach images to entries

#### FR-004: Log Filters
- Date range picker component (startDate/endDate)
- Keyword/text search input
- Reset filters button
- Apply filters in real-time or on button click
- Show active filter count badge
- Persist filter state while navigating

#### FR-005: Navigation & Routing
- Dashboard route: `/`
- Projects route: `/projects`
- Project details/entries route: `/projects/:projectId`
- Create project form route: `/projects/new`
- Edit project form route: `/projects/:projectId/edit`
- Responsive header with navigation links
- Breadcrumb navigation on detail pages

#### FR-006: Project Creation Form
- Form fields:
  - Project name (text input, required)
  - Project path (text input, required)
  - Description (textarea, optional)
- Form validation with error messages
- Submit button with loading state
- Success notification on creation
- Redirect to projects page or dashboard on success
- Cancel button to return to previous page

### Non-Functional Requirements

#### NFR-001: Performance
- Client-side pagination for entries (no N+1 requests)
- Request caching with TanStack Query (stale-while-revalidate)
- Lazy load images on entries page
- Minimize bundle size using Vite's code splitting

#### NFR-002: User Experience
- Loading skeletons for data fetching
- Error boundary component to catch render errors
- Toast/notification system for user feedback
- Confirm dialogs for destructive actions
- Responsive design for mobile, tablet, desktop
- Keyboard navigation support for forms

#### NFR-003: Code Quality
- TypeScript strict mode
- ESLint configuration
- Component-based architecture
- Separation of concerns (api layer, hooks, components)
- Reusable utility functions and custom hooks

#### NFR-004: Maintainability
- Clear folder structure for components, hooks, pages, utils
- Consistent naming conventions
- Comprehensive prop documentation
- Error handling throughout the application
- Environment variable configuration

### Acceptance Criteria
- [ ] Dashboard displays all required statistics and charts
- [ ] Projects can be created, viewed, edited, and deleted
- [ ] Log entries can be displayed with pagination and filtering working correctly
- [ ] All forms have proper validation and error handling
- [ ] Application is fully responsive on mobile, tablet, and desktop
- [ ] API calls handle errors gracefully with user-friendly messages
- [ ] Images can be uploaded and displayed with log entries
- [ ] All navigation routes work correctly
- [ ] Application builds without errors
- [ ] Performance is acceptable (< 3s initial load)
- [ ] ESLint passes with no errors
- [ ] TypeScript compiles without errors in strict mode

## Technical Approach

### Architecture Overview

```
Frontend (React + Vite)
├── UI Layer (React Components)
│   ├── Pages (Dashboard, Projects, Entries)
│   ├── Features (Forms, Filters, Tables)
│   └── Shared (Header, Navigation, Modals)
├── State Management (React Context API)
│   ├── Auth Context (if needed for future)
│   ├── UI Context (loading, toast notifications)
│   └── Filter Context (persist filter state)
├── Server State (TanStack Query)
│   ├── useProjects hook
│   ├── useEntries hook
│   └── useDashboard hook
├── API Client Layer
│   ├── projectsApi.ts
│   ├── entriesApi.ts
│   └── dashboardApi.ts
└── Utilities & Hooks
    ├── formatDate, formatTime utilities
    ├── useAsync hook
    └── API error handling
```

### Technology Stack

**Core**:
- React 18.x - UI framework
- Vite 5.x - Build tool and dev server
- TypeScript 5.x - Type safety

**State Management & Server State**:
- React Context API - Client state (UI state, filters)
- TanStack Query (React Query) v5 - Server state caching and synchronization

**Styling**:
- Tailwind CSS - Utility-first CSS framework
- Headless UI / Radix UI - Unstyled accessible components for complex interactions

**UI Components & Features**:
- React Hook Form - Form state management with minimal re-renders
- Zod - Client-side schema validation (mirror backend schemas)
- Recharts - Data visualization for activity chart
- React Toastify - Toast notifications
- Lucide React - Icon library

**Development**:
- ESLint - Code linting
- Prettier - Code formatting
- @types/react - TypeScript definitions

### Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   │
│   ├── api/
│   │   ├── client.ts (Axios instance, base URL)
│   │   ├── projectsApi.ts (Projects CRUD)
│   │   ├── entriesApi.ts (Entries CRUD, filtering)
│   │   └── dashboardApi.ts (Dashboard statistics)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Skeleton.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectTable.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectDeleteModal.tsx
│   │   │
│   │   ├── entries/
│   │   │   ├── EntriesTable.tsx
│   │   │   ├── EntryForm.tsx
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryImage.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── EntryDeleteModal.tsx
│   │   │
│   │   ├── filters/
│   │   │   ├── EntryFilters.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── FilterBadge.tsx
│   │   │   └── SearchInput.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── RecentEntriesList.tsx
│   │       ├── ProjectStatsChart.tsx
│   │       ├── ActivityChart.tsx
│   │       └── QuickActions.tsx
│   │
│   ├── context/
│   │   ├── FilterContext.tsx
│   │   ├── UIContext.tsx (loading, toast notifications)
│   │   └── useFilterContext.ts
│   │
│   ├── hooks/
│   │   ├── useProjects.ts (TanStack Query hook)
│   │   ├── useEntries.ts (TanStack Query hook)
│   │   ├── useDashboard.ts (TanStack Query hook)
│   │   ├── useAsync.ts
│   │   ├── useDebounce.ts
│   │   ├── useToast.ts
│   │   └── useAsync.ts
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── CreateProjectPage.tsx
│   │   ├── EditProjectPage.tsx
│   │   ├── EntriesPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── types/
│   │   ├── api.ts (Mirror backend types)
│   │   ├── index.ts (Export all types)
│   │   └── models.ts (Project, LogEntry, etc.)
│   │
│   ├── utils/
│   │   ├── constants.ts (API_URL, pagination defaults)
│   │   ├── formatDate.ts
│   │   ├── formatTime.ts
│   │   ├── validators.ts
│   │   ├── errors.ts (Error handling utilities)
│   │   └── cn.ts (Tailwind classname utilities)
│   │
│   ├── styles/
│   │   ├── globals.css (Tailwind imports)
│   │   └── animations.css
│   │
│   └── config/
│       ├── queryClient.ts (TanStack Query configuration)
│       └── routing.ts (Route definitions)
│
└── package.json
```

### API Client Layer

**`src/api/client.ts`**:
- Axios instance with base URL from environment variable
- Default headers and timeout
- Error interceptor for consistent error handling
- Request/response interceptors for logging (dev mode)

**`src/api/projectsApi.ts`**:
- `listProjects(page, limit)` - GET /api/projects
- `getProject(id)` - GET /api/projects/:id
- `createProject(data)` - POST /api/projects
- `updateProject(id, data)` - PUT /api/projects/:id
- `deleteProject(id)` - DELETE /api/projects/:id

**`src/api/entriesApi.ts`**:
- `listEntries(projectId, filters)` - GET /api/projects/:projectId/entries
- `getEntry(projectId, entryId)` - GET /api/projects/:projectId/entries/:entryId
- `createEntry(projectId, data)` - POST /api/projects/:projectId/entries
- `updateEntry(projectId, entryId, data)` - PUT /api/projects/:projectId/entries/:entryId
- `deleteEntry(projectId, entryId)` - DELETE /api/projects/:projectId/entries/:entryId
- `uploadImage(projectId, entryId, file)` - POST /api/projects/:projectId/entries/:entryId/image

**`src/api/dashboardApi.ts`**:
- `getDashboardStats()` - Aggregate calls for dashboard data
- Helper method to calculate activity data for last 7 days

### State Management Strategy

**React Context API Usage**:
- **UIContext**: Global loading states, toast notifications
- **FilterContext**: Entry filters (dates, keyword, pagination) with localStorage persistence

**TanStack Query (React Query) Usage**:
- Server state (Projects, Entries, Dashboard data)
- Automatic caching and stale-while-revalidate strategy
- Mutation hooks for POST/PUT/DELETE operations
- Optimistic updates for UX improvement

### Component Architecture

**Layout Components**:
- **Header**: Site title, navigation links, current project indicator
- **Navigation**: Sidebar or top nav with links to Dashboard, Projects, Entries
- **Breadcrumb**: Context-aware breadcrumb trail (Dashboard > Projects > [ProjectName])
- **MainLayout**: Wraps pages with header, nav, footer

**Common/Shared Components**:
- **Button**: Primary, secondary, danger variants, loading states
- **Card**: Reusable card container with optional header/footer
- **Modal/Dialog**: Confirmation dialogs for destructive actions
- **LoadingSpinner**: Centered spinner with optional overlay
- **ErrorBoundary**: Class component that catches render errors
- **Toast**: Notification system with success/error/info/warning variants
- **ConfirmDialog**: Reusable delete confirmation
- **Skeleton**: Loading placeholder while data fetches

**Feature Components**:
- **ProjectForm**: Controlled form with validation (create/edit modes)
- **ProjectTable**: Paginated table of projects with actions
- **ProjectCard**: Card view alternative for projects
- **EntriesTable**: Paginated, sortable entries table
- **EntryForm**: Controlled form for creating/editing entries
- **EntryFilters**: Date range, keyword search, filter reset
- **ImageUpload**: Drag-drop or click upload with preview
- **ActivityChart**: Line chart showing entry creation trends (Recharts)
- **ProjectStatsChart**: Bar chart of entries per project

**Page Components**:
- **Dashboard**: Statistics + Recent entries + Charts + Quick actions
- **ProjectsPage**: List all projects with create/edit/delete actions
- **ProjectDetailPage**: Show project info and link to entries
- **CreateProjectPage**: Dedicated create project form
- **EditProjectPage**: Edit existing project
- **EntriesPage**: Entries list with filters, pagination, actions

### Forms & Validation

**Tools**:
- React Hook Form for state management (minimal re-renders)
- Zod for schema validation (mirrors backend schemas)
- Custom error messages aligned with backend

**Validation Examples**:
```typescript
// Client-side schemas in src/schemas/project.ts
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  path: z.string().min(1, 'Project path is required'),
  description: z.string().max(1000).optional().nullable(),
});
```

### Error Handling Strategy

1. **API Layer Errors**: Catch in axios interceptor, format error message
2. **Component Level**: Try-catch in event handlers, set error state
3. **Global Errors**: ErrorBoundary catches render errors
4. **User Feedback**: Toast notifications for all errors
5. **Developer Console**: Structured logging in development mode

### Image Handling

- Upload via FormData (multipart/form-data)
- Display in entries list with lazy loading
- Show placeholder while loading
- Error handling for failed uploads
- Optional: Preview before upload in modal

## Implementation Plan

### Phase 1: Project Setup & Infrastructure (Estimated: 4 hours)

**Objective**: Set up Vite project, install dependencies, configure build tools, and establish API client layer.

**Tasks**:

1. **Initialize Vite Project** (Est: 1 hour)
   - Action: Create new Vite React project
   - Command: `npm create vite@latest frontend -- --template react-ts`
   - Configure TypeScript to strict mode in `tsconfig.json`
   - Ensure Node 18+ compatibility

2. **Install Core Dependencies** (Est: 0.5 hours)
   - File: `package.json`
   - Action: Add dependencies:
     - React & React DOM (18.x)
     - @tanstack/react-query (5.x)
     - react-hook-form
     - zod
     - axios
     - recharts
     - lucide-react
     - react-toastify
     - clsx (for className utilities)
   - Dev dependencies:
     - Tailwind CSS
     - PostCSS
     - autoprefixer
     - ESLint + TypeScript plugin
     - Prettier

3. **Configure Tailwind CSS** (Est: 0.5 hours)
   - File: `tailwind.config.js`
   - Action: Create and configure Tailwind config
   - File: `postcss.config.js`
   - Action: Set up PostCSS for Tailwind processing
   - File: `src/styles/globals.css`
   - Action: Import Tailwind directives

4. **Configure Vite Build** (Est: 0.5 hours)
   - File: `vite.config.ts`
   - Action: Create Vite config with:
     - React plugin setup
     - Alias configuration (@ → src/)
     - Build optimization settings
     - Environment variable handling

5. **Setup Environment Configuration** (Est: 0.5 hours)
   - File: `.env.example`
   - Action: Create template for environment variables
     - `VITE_API_URL=http://localhost:3000`
     - `VITE_APP_NAME=OpenLog`
   - File: `.env.local`
   - Action: Create local development config

6. **Create API Client Layer** (Est: 1 hour)
   - File: `src/api/client.ts`
   - Action: Set up Axios instance with:
     - Base URL from env variable
     - Default headers
     - Error interceptor
     - Request/response logging middleware
   - File: `src/api/projectsApi.ts`
   - Action: Implement project API methods
   - File: `src/api/entriesApi.ts`
   - Action: Implement entries API methods
   - File: `src/api/dashboardApi.ts`
   - Action: Implement dashboard aggregation methods

**Deliverables**:
- [ ] Frontend project created with Vite
- [ ] All dependencies installed
- [ ] Tailwind CSS configured and working
- [ ] Vite build config optimized
- [ ] API client layer fully functional
- [ ] TypeScript strict mode enabled

**Dependencies**: None

---

### Phase 2: Core Infrastructure & State Management (Estimated: 6 hours)

**Objective**: Establish React Context API for state management, configure TanStack Query, create reusable hooks, and set up type definitions.

**Tasks**:

1. **Configure TanStack Query** (Est: 1 hour)
   - File: `src/config/queryClient.ts`
   - Action: Create QueryClient instance with:
     - Default stale time: 5 minutes
     - Cache time: 10 minutes
     - Retry logic (3 retries with exponential backoff)
     - Error handling
   - File: `src/main.tsx`
   - Action: Wrap app with QueryClientProvider

2. **Create Type Definitions** (Est: 1 hour)
   - File: `src/types/models.ts`
   - Action: Define TypeScript interfaces mirroring backend:
     - Project interface
     - LogEntry interface
     - PaginatedResponse interface
     - Pagination parameters
   - File: `src/types/api.ts`
   - Action: Define API response wrapper types
   - File: `src/types/index.ts`
   - Action: Export all types for easy importing

3. **Setup React Context for UI State** (Est: 1.5 hours)
   - File: `src/context/UIContext.tsx`
   - Action: Create context for:
     - Global loading state
     - Toast notifications queue
     - Error handling
   - File: `src/context/useUIContext.ts`
   - Action: Create custom hook for accessing UI context
   - Action: Include helper methods (showToast, setLoading, showError)

4. **Setup React Context for Filters** (Est: 1.5 hours)
   - File: `src/context/FilterContext.tsx`
   - Action: Create context for entry filters with:
     - Date range (startDate, endDate)
     - Keyword
     - Pagination (page, limit)
     - localStorage persistence for filter preferences
   - File: `src/context/useFilterContext.ts`
   - Action: Create custom hook with methods to:
     - Update filters
     - Reset filters
     - Set pagination
     - Load persisted filters on mount

5. **Create Custom Hooks** (Est: 1.5 hours)
   - File: `src/hooks/useProjects.ts`
   - Action: Implement TanStack Query hooks:
     - useProjectsList (query with pagination)
     - useProject (single project)
     - useCreateProject (mutation)
     - useUpdateProject (mutation)
     - useDeleteProject (mutation)
   
   - File: `src/hooks/useEntries.ts`
   - Action: Implement TanStack Query hooks:
     - useEntries (query with filters)
     - useEntry (single entry)
     - useCreateEntry (mutation)
     - useUpdateEntry (mutation)
     - useDeleteEntry (mutation)
     - useUploadImage (mutation for image upload)
   
   - File: `src/hooks/useDashboard.ts`
   - Action: Implement dashboard data hooks:
     - useDashboardStats (aggregated data)
     - useRecentEntries (last 10 entries)
     - useActivityData (last 7 days entry creation)
   
   - File: `src/hooks/useDebounce.ts`
   - Action: Implement debounce hook for search input
   
   - File: `src/hooks/useAsync.ts`
   - Action: Implement generic async hook with loading/error states

6. **Create Utility Functions** (Est: 1 hour)
   - File: `src/utils/formatDate.ts`
   - Action: Export functions:
     - formatDate(date: string) - format to "Dec 25, 2024"
     - formatDateTime(date: string) - format with time
     - formatTimeAgo(date: string) - "2 hours ago"
   
   - File: `src/utils/errors.ts`
   - Action: Error handling utilities:
     - parseApiError(error: unknown) - extract error message
     - getErrorMessage(error: unknown) - user-friendly messages
   
   - File: `src/utils/constants.ts`
   - Action: Define constants:
     - Pagination defaults (ITEMS_PER_PAGE = 10)
     - API URLs
     - Error messages
   
   - File: `src/utils/cn.ts`
   - Action: Create classname utility (clsx wrapper)

**Deliverables**:
- [ ] TanStack Query configured globally
- [ ] All type definitions created and exported
- [ ] UIContext and FilterContext working
- [ ] All custom hooks implemented and tested
- [ ] Utility functions ready to use
- [ ] QueryClient integrated with React app

**Dependencies**: Depends on Phase 1

---

### Phase 3: Shared Components & Layout (Estimated: 5 hours)

**Objective**: Build reusable UI components and layout structure that all pages will use.

**Tasks**:

1. **Create Layout Components** (Est: 1.5 hours)
   - File: `src/components/layout/Header.tsx`
   - Action: Build header with:
     - Application title/logo
     - Navigation links (Dashboard, Projects)
     - Current project indicator (if on project page)
   
   - File: `src/components/layout/Navigation.tsx`
   - Action: Build sidebar or top navigation with:
     - Links to main routes
     - Active state highlighting
     - Mobile-responsive menu button
   
   - File: `src/components/layout/Breadcrumb.tsx`
   - Action: Create dynamic breadcrumb showing current page context
   
   - File: `src/components/layout/MainLayout.tsx`
   - Action: Wrapper component combining:
     - Header
     - Navigation
     - Main content area
     - Footer (if needed)

2. **Create Common Components** (Est: 2 hours)
   - File: `src/components/common/Button.tsx`
   - Action: Flexible button with variants:
     - primary, secondary, danger, ghost
     - Loading state with spinner
     - Disabled state
     - Size variants (sm, md, lg)
   
   - File: `src/components/common/Card.tsx`
   - Action: Reusable card component with:
     - Header/title section
     - Body content
     - Footer/action section
     - Optional hover effects
   
   - File: `src/components/common/Modal.tsx`
   - Action: Modal/dialog component with:
     - Overlay
     - Centered content
     - Close button
     - Keyboard ESC handling
   
   - File: `src/components/common/LoadingSpinner.tsx`
   - Action: Animated spinner component
     - With optional overlay
     - Size variants
   
   - File: `src/components/common/ErrorBoundary.tsx`
   - Action: Class component for error catching:
     - Render fallback UI on error
     - Log errors to console
     - Show error details in dev mode
   
   - File: `src/components/common/Toast.tsx`
   - Action: Toast notification component with:
     - Multiple types (success, error, info, warning)
     - Auto-dismiss timer
     - Manual close button
     - Positioned at top-right
   
   - File: `src/components/common/ConfirmDialog.tsx`
   - Action: Reusable confirmation dialog:
     - Title, message, confirm/cancel buttons
     - Warning styling for destructive actions
     - Keyboard support (Enter/Escape)
   
   - File: `src/components/common/Skeleton.tsx`
   - Action: Loading skeleton component:
     - Animated placeholder
     - Multiple variants (text, card, table-row)

3. **Setup Toast Provider** (Est: 0.5 hours)
   - File: `src/App.tsx`
   - Action: Wrap app with:
     - ToastContainer (from react-toastify)
     - ErrorBoundary
     - QueryClientProvider
     - UIContext provider
     - FilterContext provider

4. **Create Styles** (Est: 1 hour)
   - File: `src/styles/globals.css`
   - Action: Add Tailwind imports and global styles
   - File: `src/styles/animations.css`
   - Action: Custom animations:
     - Fade in/out
     - Slide in
     - Skeleton pulse
     - Spinner rotation

**Deliverables**:
- [ ] All layout components created and styled
- [ ] All common/shared components created
- [ ] Tailwind styles applied correctly
- [ ] Toast notification system working
- [ ] Error boundary catching errors
- [ ] App wrapper with all providers configured

**Dependencies**: Depends on Phase 1 & 2

---

### Phase 4: Form Components & Validation (Estimated: 4 hours)

**Objective**: Create form components with validation for projects and entries.

**Tasks**:

1. **Create Project Form Component** (Est: 1.5 hours)
   - File: `src/components/projects/ProjectForm.tsx`
   - Action: Build form with:
     - React Hook Form for state management
     - Zod validation schema
     - Fields: name, path, description
     - Submit button with loading state
     - Error messages under each field
     - Support for create/edit modes
     - onSuccess callback to redirect
   
   - File: `src/schemas/project.ts`
   - Action: Create Zod schemas:
     - CreateProjectSchema
     - UpdateProjectSchema

2. **Create Entry Form Component** (Est: 1.5 hours)
   - File: `src/components/entries/EntryForm.tsx`
   - Action: Build form with:
     - React Hook Form for state management
     - Zod validation schema
     - Content textarea field
     - Image upload integration
     - Submit button with loading state
     - Error handling
     - Support for create/edit modes
   
   - File: `src/schemas/entry.ts`
   - Action: Create Zod schemas:
     - CreateEntrySchema
     - UpdateEntrySchema

3. **Create Image Upload Component** (Est: 1 hour)
   - File: `src/components/entries/ImageUpload.tsx`
   - Action: Build image upload with:
     - Drag-and-drop zone
     - Click to browse
     - File preview before upload
     - File size validation
     - Loading state during upload
     - Error handling
     - Success callback

4. **Create Filter Components** (Est: 1 hour)
   - File: `src/components/filters/DateRangePicker.tsx`
   - Action: Build date range picker with:
     - Two date inputs (startDate, endDate)
     - Calendar UI (HTML5 input or date picker library)
     - Validation (endDate > startDate)
   
   - File: `src/components/filters/SearchInput.tsx`
   - Action: Build search input with:
     - Debounced onChange handler
     - Clear button
     - Search icon
   
   - File: `src/components/filters/EntryFilters.tsx`
   - Action: Combine filters into one component:
     - Date range picker
     - Keyword search
     - Apply/Reset buttons
     - Show active filter badge count
     - Integration with FilterContext

**Deliverables**:
- [ ] ProjectForm component working with validation
- [ ] EntryForm component working with validation
- [ ] ImageUpload component with drag-drop
- [ ] All filter components created
- [ ] Zod schemas defined
- [ ] Form validation error messages displaying correctly

**Dependencies**: Depends on Phase 2 & 3

---

### Phase 5: Dashboard & Statistics Page (Estimated: 3 hours)

**Objective**: Build the dashboard with statistics, charts, and quick actions.

**Tasks**:

1. **Create Dashboard Statistics Components** (Est: 1 hour)
   - File: `src/components/dashboard/StatsCard.tsx`
   - Action: Reusable card showing a single stat:
     - Title
     - Large number
     - Icon
     - Optional trend/comparison
   
   - File: `src/components/dashboard/QuickActions.tsx`
   - Action: Quick action buttons:
     - Create new project button
     - Link to view all projects
     - Link to recent entries

2. **Create Data Visualization Components** (Est: 1.5 hours)
   - File: `src/components/dashboard/ActivityChart.tsx`
   - Action: Line chart showing:
     - Entry creation trends (last 7 days)
     - Using Recharts library
     - Responsive to screen size
     - Loading and error states
   
   - File: `src/components/dashboard/ProjectStatsChart.tsx`
   - Action: Bar chart showing:
     - Number of entries per project
     - Top 5 projects
     - Using Recharts library
   
   - File: `src/components/dashboard/RecentEntriesList.tsx`
   - Action: Display recent entries:
     - Show last 10 entries across all projects
     - Show project name, entry preview, creation date
     - Link to full entry
     - Loading skeleton while fetching

3. **Create Dashboard Page** (Est: 0.5 hours)
   - File: `src/pages/Dashboard.tsx`
   - Action: Assemble dashboard:
     - Fetch dashboard data using useDashboard hook
     - Display project count stat
     - Display entry count stat
     - Display recent entries list
     - Display activity chart
     - Display project stats chart
     - Quick actions
     - Error handling and retry buttons

**Deliverables**:
- [ ] Dashboard displays all 4 required statistics
- [ ] Activity chart shows last 7 days data
- [ ] Project stats chart shows entries per project
- [ ] Recent entries list loads and displays
- [ ] Dashboard is responsive
- [ ] Loading states work correctly

**Dependencies**: Depends on Phase 2, 3, & 4

---

### Phase 6: Projects Management Page (Estimated: 4 hours)

**Objective**: Build the projects listing, creation, editing, and deletion functionality.

**Tasks**:

1. **Create Project Display Components** (Est: 1 hour)
   - File: `src/components/projects/ProjectTable.tsx`
   - Action: Build paginated table:
     - Columns: name, path, description, creation date, actions
     - Action buttons: view entries, edit, delete
     - Pagination controls
     - Loading skeleton
     - Empty state message
   
   - File: `src/components/projects/ProjectCard.tsx`
   - Action: Alternative card view (optional):
     - Project info displayed as card
     - Quick action buttons

2. **Create Project Management Components** (Est: 1 hour)
   - File: `src/components/projects/ProjectDeleteModal.tsx`
   - Action: Confirmation dialog:
     - Warning message
     - Confirm/Cancel buttons
     - Loading state
     - Error handling
   
   - File: `src/pages/ProjectsPage.tsx`
   - Action: Main projects listing page:
     - Use useProjectsList hook for pagination
     - Display project table
     - Create new project button
     - Error handling with retry

3. **Create Project Creation Page** (Est: 1 hour)
   - File: `src/pages/CreateProjectPage.tsx`
   - Action: Dedicated page for creating project:
     - Use ProjectForm component
     - Redirect to projects list on success
     - Show success toast
     - Cancel button to go back

4. **Create Project Edit Page** (Est: 1 hour)
   - File: `src/pages/EditProjectPage.tsx`
   - Action: Page for editing project:
     - Load project data using useProject hook
     - Pre-fill form with project data
     - Use ProjectForm in edit mode
     - Show success toast on update
     - Cancel button to go back
   
   - File: `src/pages/ProjectDetailPage.tsx`
   - Action: Show project details:
     - Project info display
     - Link to view entries for this project
     - Edit project button
     - Delete project button

**Deliverables**:
- [ ] Projects listing page displays all projects
- [ ] Pagination working correctly
- [ ] Create new project page working
- [ ] Edit project page working
- [ ] Delete functionality working with confirmation
- [ ] All navigation working between pages
- [ ] Error handling throughout

**Dependencies**: Depends on Phase 2, 3, 4

---

### Phase 7: Log Entries & Filtering (Estimated: 5 hours)

**Objective**: Build the entries listing page with comprehensive filtering capabilities.

**Tasks**:

1. **Create Entries Display Component** (Est: 1.5 hours)
   - File: `src/components/entries/EntriesTable.tsx`
   - Action: Build entries table:
     - Columns: content preview, image indicator, creation date, actions
     - Each row clickable to show full entry
     - Edit button
     - Delete button
     - Pagination controls
     - Loading skeleton
     - Empty state message
   
   - File: `src/components/entries/EntryCard.tsx`
   - Action: Individual entry card:
     - Shows full content
     - Shows image (if present)
     - Shows creation date
     - Shows actions

2. **Create Entry Display & Image Components** (Est: 1 hour)
   - File: `src/components/entries/EntryImage.tsx`
   - Action: Image display component:
     - Lazy loading
     - Placeholder while loading
     - Error state with fallback
     - Click to expand modal
   
   - File: `src/components/entries/EntryPreview.tsx`
   - Action: Show truncated entry content with ellipsis

3. **Create Entries Management Components** (Est: 1 hour)
   - File: `src/components/entries/EntryDeleteModal.tsx`
   - Action: Delete confirmation dialog
   
   - File: `src/components/entries/CreateEntryModal.tsx`
   - Action: Modal with entry form for quick creation

4. **Create Entries Page** (Est: 1 hour)
   - File: `src/pages/EntriesPage.tsx`
   - Action: Main entries listing page:
     - Load entries based on selected project and filters
     - Display EntryFilters component
     - Display EntriesTable component
     - Integrate FilterContext for filter state
     - Use useEntries hook with pagination and filters
     - Show active filter count
     - Create new entry button
     - Error handling and retry

5. **Setup Routing** (Est: 0.5 hours)
   - File: `src/App.tsx`
   - Action: Add React Router (or similar):
     - Route: `/` → Dashboard
     - Route: `/projects` → ProjectsPage
     - Route: `/projects/new` → CreateProjectPage
     - Route: `/projects/:projectId` → ProjectDetailPage
     - Route: `/projects/:projectId/edit` → EditProjectPage
     - Route: `/projects/:projectId/entries` → EntriesPage
     - Route: `/projects/:projectId/entries/:entryId` → EntryDetailPage (optional)
     - Route: `*` → NotFoundPage

**Deliverables**:
- [ ] Entries table displays all entries for selected project
- [ ] Pagination working correctly
- [ ] Filtering by date range working
- [ ] Filtering by keyword working
- [ ] Filter count badge showing
- [ ] Create new entry working
- [ ] Edit entry working
- [ ] Delete entry working with confirmation
- [ ] Images displaying correctly
- [ ] All routes working
- [ ] Responsive design

**Dependencies**: Depends on Phase 2, 3, 4, 5, 6

---

### Phase 8: Testing & Validation (Estimated: 4 hours)

**Objective**: Test all functionality, validate user interactions, and ensure performance.

**Tasks**:

1. **Setup Testing Infrastructure** (Est: 1 hour)
   - File: `vite.config.ts`
   - Action: Configure Vitest for unit testing
   - Install testing dependencies:
     - vitest
     - @testing-library/react
     - @testing-library/user-event
   - Create `vitest.config.ts`

2. **Create Test Files** (Est: 2 hours)
   - File: `src/components/common/__tests__/Button.test.tsx`
   - Action: Test button component
   
   - File: `src/hooks/__tests__/useDebounce.test.ts`
   - Action: Test debounce hook
   
   - File: `src/utils/__tests__/formatDate.test.ts`
   - Action: Test date formatting functions
   
   - File: `src/pages/__tests__/Dashboard.test.tsx`
   - Action: Test dashboard page rendering
   
   - Run: `npm test` to execute tests

3. **Manual Testing Checklist** (Est: 1 hour)
   - [ ] Dashboard loads and displays all statistics
   - [ ] Project creation form validates inputs
   - [ ] New project created successfully
   - [ ] Project edit form pre-fills data
   - [ ] Project update works
   - [ ] Project deletion shows confirmation and deletes
   - [ ] Entries table displays entries for selected project
   - [ ] Pagination navigation works
   - [ ] Date range filter works
   - [ ] Keyword search works
   - [ ] Filter reset works
   - [ ] Entry creation form validates
   - [ ] New entry created successfully
   - [ ] Entry update works
   - [ ] Entry deletion shows confirmation and deletes
   - [ ] Image upload works with preview
   - [ ] Images display in entry list
   - [ ] All navigation links work
   - [ ] Responsive design on mobile (375px)
   - [ ] Responsive design on tablet (768px)
   - [ ] Responsive design on desktop (1920px)
   - [ ] Toast notifications appear on actions
   - [ ] Error messages display on failures
   - [ ] Loading states show during data fetching
   - [ ] ESLint passes: `npm run lint`
   - [ ] TypeScript compiles: `npm run build`
   - [ ] No console errors or warnings

**Deliverables**:
- [ ] Unit tests written for core utilities and components
- [ ] All manual testing checklist items passing
- [ ] ESLint configuration passes
- [ ] TypeScript strict mode passes
- [ ] Build completes without errors
- [ ] No console errors or warnings
- [ ] Responsive on all breakpoints

**Dependencies**: Depends on all previous phases

---

### Phase 9: Performance & Optimization (Estimated: 2 hours)

**Objective**: Optimize bundle size, loading performance, and render performance.

**Tasks**:

1. **Analyze & Optimize Bundle** (Est: 1 hour)
   - Run: `npm run build` to create production bundle
   - Action: Review bundle size
   - Action: Enable code splitting for routes (React lazy + Suspense)
   - Action: Lazy load heavy components (charts)
   - File: `src/App.tsx`
   - Action: Use React.lazy() for route components

2. **Performance Monitoring** (Est: 0.5 hours)
   - Add Vite plugin for bundle analysis (vite-plugin-visualizer)
   - Run analysis to identify large dependencies
   - Document any large dependencies that can't be optimized

3. **Image Optimization** (Est: 0.5 hours)
   - Ensure images are properly optimized
   - Implement lazy loading for images in entries
   - Use modern image formats if possible

**Deliverables**:
- [ ] Bundle size < 500KB (gzipped)
- [ ] Initial page load < 3 seconds
- [ ] Code splitting implemented for routes
- [ ] No unnecessary re-renders

**Dependencies**: Depends on Phase 8

---

## File Changes Summary

### Files to Create

**Configuration Files**:
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/postcss.config.js` - PostCSS configuration
- `frontend/.eslintrc.cjs` - ESLint configuration
- `frontend/.prettierrc` - Prettier formatting config
- `.env.example` - Environment variables template

**Core Application**:
- `frontend/src/main.tsx` - Application entry point
- `frontend/src/App.tsx` - Root component with routing
- `frontend/src/index.html` - HTML template

**API Layer**:
- `frontend/src/api/client.ts` - Axios client setup
- `frontend/src/api/projectsApi.ts` - Projects API methods
- `frontend/src/api/entriesApi.ts` - Entries API methods
- `frontend/src/api/dashboardApi.ts` - Dashboard API methods

**Configuration & Setup**:
- `frontend/src/config/queryClient.ts` - TanStack Query setup
- `frontend/src/config/routing.ts` - Route definitions

**Context & State**:
- `frontend/src/context/UIContext.tsx` - UI state context
- `frontend/src/context/useUIContext.ts` - UI context hook
- `frontend/src/context/FilterContext.tsx` - Filter context
- `frontend/src/context/useFilterContext.ts` - Filter context hook

**Custom Hooks** (all in `frontend/src/hooks/`):
- `useProjects.ts` - Projects queries and mutations
- `useEntries.ts` - Entries queries and mutations
- `useDashboard.ts` - Dashboard data hooks
- `useDebounce.ts` - Debounce hook
- `useAsync.ts` - Generic async hook
- `useToast.ts` - Toast notification hook

**Type Definitions** (all in `frontend/src/types/`):
- `models.ts` - Backend model interfaces
- `api.ts` - API response types
- `index.ts` - Type exports

**Utilities** (all in `frontend/src/utils/`):
- `formatDate.ts` - Date formatting functions
- `formatTime.ts` - Time formatting functions
- `errors.ts` - Error handling utilities
- `constants.ts` - Application constants
- `cn.ts` - Classname utility

**Styles** (all in `frontend/src/styles/`):
- `globals.css` - Global styles with Tailwind
- `animations.css` - Custom animations

**Layout Components** (all in `frontend/src/components/layout/`):
- `Header.tsx` - Application header
- `Navigation.tsx` - Main navigation
- `Breadcrumb.tsx` - Breadcrumb navigation
- `MainLayout.tsx` - Layout wrapper

**Common Components** (all in `frontend/src/components/common/`):
- `Button.tsx` - Reusable button component
- `Card.tsx` - Card wrapper component
- `Modal.tsx` - Modal/dialog component
- `LoadingSpinner.tsx` - Loading indicator
- `ErrorBoundary.tsx` - Error boundary
- `Toast.tsx` - Toast notification
- `ConfirmDialog.tsx` - Confirmation dialog
- `Skeleton.tsx` - Loading skeleton

**Project Components** (all in `frontend/src/components/projects/`):
- `ProjectTable.tsx` - Projects listing table
- `ProjectCard.tsx` - Project card view
- `ProjectForm.tsx` - Create/edit form
- `ProjectDeleteModal.tsx` - Delete confirmation

**Entry Components** (all in `frontend/src/components/entries/`):
- `EntriesTable.tsx` - Entries listing
- `EntryForm.tsx` - Create/edit form
- `EntryCard.tsx` - Entry card display
- `EntryImage.tsx` - Image display
- `ImageUpload.tsx` - Image upload component
- `EntryDeleteModal.tsx` - Delete confirmation
- `CreateEntryModal.tsx` - Quick create modal

**Filter Components** (all in `frontend/src/components/filters/`):
- `EntryFilters.tsx` - Filter control panel
- `DateRangePicker.tsx` - Date range selector
- `SearchInput.tsx` - Search input
- `FilterBadge.tsx` - Active filter count badge

**Dashboard Components** (all in `frontend/src/components/dashboard/`):
- `StatsCard.tsx` - Statistics card
- `RecentEntriesList.tsx` - Recent entries display
- `ProjectStatsChart.tsx` - Project stats chart
- `ActivityChart.tsx` - Activity chart
- `QuickActions.tsx` - Quick action buttons

**Pages** (all in `frontend/src/pages/`):
- `Dashboard.tsx` - Dashboard page
- `ProjectsPage.tsx` - Projects listing
- `ProjectDetailPage.tsx` - Project details
- `CreateProjectPage.tsx` - Create project
- `EditProjectPage.tsx` - Edit project
- `EntriesPage.tsx` - Entries listing
- `NotFoundPage.tsx` - 404 page

**Schemas**:
- `frontend/src/schemas/project.ts` - Project validation schemas
- `frontend/src/schemas/entry.ts` - Entry validation schemas

**Test Files** (all in `__tests__` folders):
- `frontend/src/components/common/__tests__/Button.test.tsx`
- `frontend/src/hooks/__tests__/useDebounce.test.ts`
- `frontend/src/utils/__tests__/formatDate.test.ts`
- `frontend/src/pages/__tests__/Dashboard.test.tsx`

**Package Configuration**:
- `frontend/package.json` - Dependencies and scripts

### Files to Modify

**Backend** (minimal changes):
- `package.json` (root) - May need to add frontend workspace or script
- May add `frontend` as npm workspace

## Dependencies & Integration

### External Dependencies

**Core Framework**:
- react: ^18.0.0
- react-dom: ^18.0.0
- vite: ^5.0.0

**State Management & Data Fetching**:
- @tanstack/react-query: ^5.0.0
- react-hook-form: ^7.48.0
- zod: ^3.23.0

**HTTP Client**:
- axios: ^1.6.0

**Styling**:
- tailwindcss: ^3.4.0
- postcss: ^8.4.0
- autoprefixer: ^10.4.0

**UI Components & Utilities**:
- react-router-dom: ^6.20.0 (for routing)
- recharts: ^2.10.0 (for charts)
- lucide-react: ^0.292.0 (for icons)
- react-toastify: ^9.1.0 (for notifications)
- clsx: ^2.0.0 (for classnames)

**Development**:
- typescript: ^5.3.0
- @types/react: ^18.0.0
- @types/react-dom: ^18.0.0
- @types/node: ^20.0.0
- eslint: ^8.0.0
- @typescript-eslint/eslint-plugin: ^6.0.0
- @typescript-eslint/parser: ^6.0.0
- prettier: ^3.0.0
- vitest: ^0.34.0
- @testing-library/react: ^14.0.0
- @testing-library/user-event: ^14.0.0

### Internal Dependencies

**Frontend depends on Backend**:
- API endpoints at `http://localhost:3000`
- Response format consistency
- Data model stability

**Backend considerations**:
- CORS is already enabled in backend
- Health check endpoint available at `/health`
- Error handling returns consistent format

## Risks & Considerations

### Technical Risks

**Risk 1: API Response Format Changes**
- **Description**: If backend API response format changes, frontend will break
- **Mitigation**: 
  - Validate response types in API client layer
  - Version API endpoints if possible
  - Create integration tests that validate API contract

**Risk 2: Large Image Files**
- **Description**: Uploading large images could slow down the application
- **Mitigation**:
  - Implement client-side image compression before upload
  - Add file size validation in upload component
  - Show file size to user before upload

**Risk 3: Network Latency on Filters**
- **Description**: Applying multiple filters rapidly could create many API requests
- **Mitigation**:
  - Debounce search input (already planned)
  - Disable apply button while request is pending
  - Show loading state

**Risk 4: Memory Leaks with Subscriptions**
- **Description**: If using WebSockets or subscriptions, could leak memory
- **Mitigation**:
  - Clean up subscriptions in useEffect cleanup
  - Use TanStack Query's built-in cleanup

### Breaking Changes

**None anticipated** - This is a new frontend for existing backend.

### Future Considerations

- **Authentication**: No auth implemented currently. Plan for later if needed.
- **Real-time Updates**: Could add WebSocket support for live log updates
- **Export Functionality**: Could add CSV/JSON export for entries
- **Advanced Search**: Could implement full-text search on backend
- **Themes**: Could add dark mode support

## Testing Strategy

### Unit Tests

**Components to Test**:
- Button component (variants, disabled, loading states)
- Card component (header, footer, children)
- Modal component (open/close, callbacks)
- Utility functions (date formatting, error parsing)

**Test Framework**: Vitest + React Testing Library

**Test Structure**:
```
src/
├── components/
│   └── common/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
```

### Integration Tests

**Workflows to Test**:
1. Create project → See it in projects list
2. View project → View entries for that project
3. Filter entries → See filtered results
4. Create entry with image → See image in entry
5. Delete entry → Confirm dialog → Entry removed

**Test Approach**:
- Mock API responses
- Test component interactions
- Verify data flow through components

### Manual Testing Checklist

See Phase 8 deliverables for comprehensive manual testing checklist.

## Rollout Plan

### Prerequisites

Before starting development:
1. Backend API running on `http://localhost:3000`
2. Health check endpoint responding
3. Database initialized with schema

### Development Environment Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local to set VITE_API_URL=http://localhost:3000

# Start dev server
npm run dev

# Dev server runs on http://localhost:5173
```

### Build & Deployment

```bash
# Build for production
npm run build

# Output in frontend/dist/
# Static files ready to serve with any HTTP server

# Preview production build locally
npm run preview
```

### Environment Variables

**.env.local** (development):
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=OpenLog
VITE_LOG_LEVEL=debug
```

**.env.production** (production):
```
VITE_API_URL=https://api.openlog.com
VITE_APP_NAME=OpenLog
VITE_LOG_LEVEL=info
```

## Success Metrics

How to measure if implementation is successful:

- **Functionality**: All features working as specified (100% acceptance criteria met)
- **Performance**: Initial page load < 3 seconds on 4G network
- **Bundle Size**: Production bundle < 500KB gzipped
- **Code Quality**: ESLint passes, TypeScript strict mode, no console errors
- **User Experience**: Forms responsive, filters work smoothly, no lag
- **Test Coverage**: > 80% for utility functions, > 50% for components
- **Accessibility**: Basic WCAG compliance (keyboard navigation, ARIA labels)
- **Browser Compatibility**: Works on Chrome, Firefox, Safari (latest 2 versions)

## Open Questions

1. Should we implement user authentication? (Deferred for now)
2. Do we need dark mode support? (Can be added later)
3. Should entries have additional metadata (tags, severity level)? (Suggest in future iteration)
4. Do we need real-time updates via WebSocket? (Not for MVP)
5. Should we support bulk operations on entries? (Can add later)

## References

### Relevant Backend Code

- `src/index.ts` - Main app setup, CORS enabled, routes configured
- `src/routes/projects.ts` - Project endpoints (line 1-60)
- `src/routes/entries.ts` - Entry endpoints (line 1-100)
- `src/types/models.ts` - Project and LogEntry interfaces
- `src/types/api.ts` - API response wrapper format

### Documentation & Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Zod Documentation](https://zod.dev)
- [Recharts Documentation](https://recharts.org)

## Appendix

### Code Patterns to Follow

**API Client Pattern** (from backend):
The backend uses consistent response format. Mirror this in frontend:

```typescript
// In frontend API client
const handleApiResponse = (response: any) => {
  if (!response.data.success) {
    throw new Error(response.data.error.message);
  }
  return response.data.data;
};
```

**Error Handling** (from backend):
Backend uses AppError class. Create similar pattern in frontend:

```typescript
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}
```

**Validation Pattern** (from backend):
Backend uses Zod. Use same schemas in frontend:

```typescript
// Share validation logic between frontend and backend
// Consider extracting to separate package if large
```

### Naming Conventions

Follow existing patterns from backend:

- **Directories**: kebab-case (`src/api`, `src/hooks`)
- **Files**: PascalCase for components (`Button.tsx`), camelCase for utilities (`formatDate.ts`)
- **Variables**: camelCase (`projectId`, `isLoading`)
- **Types/Interfaces**: PascalCase (`Project`, `LogEntry`)
- **Constants**: UPPER_SNAKE_CASE (`ITEMS_PER_PAGE`, `API_URL`)

### Component Structure Template

```typescript
import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface MyComponentProps {
  children: ReactNode;
  className?: string;
  // ... other props
}

/**
 * MyComponent - Description of what this component does
 * @param children - Child elements to render
 * @param className - Optional CSS classes
 */
export function MyComponent({ children, className }: MyComponentProps) {
  return (
    <div className={cn('base-class', className)}>
      {children}
    </div>
  );
}

export default MyComponent;
```

### Hooks Pattern Template

```typescript
import { useQuery, UseMutationOptions } from '@tanstack/react-query';
import * as api from '@/api/projectsApi';
import { useToast } from './useToast';

export function useProjects(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['projects', { page, limit }],
    queryFn: () => api.listProjects(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProject(options?: UseMutationOptions<any, Error, any>) {
  const toast = useToast();
  
  return useMutation({
    mutationFn: (data) => api.createProject(data),
    onSuccess: () => {
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...options,
  });
}
```

---

## Summary of Key Decisions

1. **State Management**: React Context API for UI state (lightweight) + TanStack Query for server state (powerful caching)
2. **Styling**: Tailwind CSS for consistency and productivity
3. **Validation**: Zod for client-side, mirroring backend schemas
4. **Forms**: React Hook Form for minimal re-renders and better performance
5. **Routing**: React Router v6 for standard React routing
6. **Project Structure**: Feature-based structure (projects/, entries/, dashboard/) for scalability
7. **API Layer**: Dedicated API client methods for type safety and maintainability
8. **Testing**: Vitest + React Testing Library for unit/integration tests

---

## Next Steps After Plan Approval

1. **Set up frontend project** (Phase 1)
2. **Install and configure tools** (Phases 1-2)
3. **Build shared components** (Phase 3)
4. **Develop feature components** (Phases 4-7)
5. **Test and optimize** (Phases 8-9)
6. **Deploy to production environment**

---

**Plan Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready for Implementation
