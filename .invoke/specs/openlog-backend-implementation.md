# OpenLog Backend - Implementation Plan

## Overview

OpenLog is a logging and build-sharing platform where users can write logs or share images of their builds. This plan covers the initial backend implementation using:
- **Hono** (ultra-lightweight HTTP framework)
- **SQLite** (database stored at `~/.openlog/openlog.db`)
- **node:sqlite** (built-in SQLite module for Node.js 24+; `better-sqlite3` adapted to avoid C++20 compilation issues on arm64)
- **Zod** (input validation)
- **Node.js + tsx** (runtime)

Images are stored at `~/.openlog/images`, and the database is stored at `~/.openlog/`.

---

## ✅ Implementation Status: COMPLETE

**Date Completed**: March 5, 2026
**Duration**: ~3.5 hours
**Status**: All 9 phases completed, all acceptance criteria met, 19/19 tests passing

### Summary of Changes
- **Adapted Technology**: Used Node.js built-in `node:sqlite` instead of `better-sqlite3` to avoid C++20 compilation issues on arm64 architecture
- **All Features Implemented**: 11 API endpoints, full CRUD, pagination, filtering, image handling
- **Comprehensive Testing**: Executed 19-test suite covering all operations, error cases, and data persistence
- **Project Structure**: 24 TypeScript files organized in 7 layers (routes, services, db, middleware, schemas, types, utils)
- **Data Persistence**: Database and images properly stored in `~/.openlog/`
- **Error Handling**: Consistent error format with proper HTTP status codes and detailed field-level validation errors

### Key Deliverables
- ✅ 11 API endpoints (5 project CRUD + 5 entry CRUD + 1 image upload + health check)
- ✅ Full pagination support (default 10, max 100 items)
- ✅ Advanced filtering (date range, keyword search)
- ✅ Image upload/retrieval with automatic cleanup
- ✅ Cascading deletes (project deletion removes entries + images)
- ✅ Input validation with Zod (all endpoints)
- ✅ Structured error responses with error codes
- ✅ SQLite database with foreign keys and indexes
- ✅ TypeScript strict mode throughout
- ✅ Production-ready project structure

---

## Current State Analysis

### Project Structure
- Fresh project (empty directory)
- Starting from scratch
- No existing dependencies or configuration

### Technology Choices (IMPLEMENTED)
- **Framework**: Hono 4.4.0 (lightweight, Cloudflare Workers compatible)
- **Database Driver**: node:sqlite (built-in Node.js module, synchronous, no async complexity)
- **Runtime**: Node.js 24+ with tsx (native TypeScript support)
- **Validation**: Zod 3.23.0 (type-safe schema validation)
- **Middleware**: @hono/node-server, @hono/zod-validator
- **Image Storage**: File system at `~/.openlog/images`
- **Language**: TypeScript 5.5.0 (strict mode)

---

## Requirements

### Functional Requirements

**FR-001**: Users can create projects with name, path, and optional description
- Projects must have unique names per user
- Projects store metadata (name, path, description, created/updated timestamps)

**FR-002**: Users can create log entries within a project
- Each entry contains: content (required), optional image, timestamp
- Log entries are linked to a project

**FR-003**: Users can retrieve paginated lists of projects and entries
- Default pagination: 10-20 items per page
- Support pagination with limit/offset

**FR-004**: Users can upload and retrieve images
- Images stored in `~/.openlog/images/{projectId}/{timestamp}_{filename}`
- Serve images via API endpoint

**FR-005**: Users can filter and search log entries
- Filter by date range
- Filter/search by keywords in content

**FR-006**: Users can update project metadata
- Update name, description of existing projects

**FR-007**: Users can delete projects and entries
- Deleting a project cascades to delete all entries
- Deleting an entry removes associated image from disk

### Non-Functional Requirements

**NFR-001**: API Response Consistency
- All responses follow a standard format with `success`, `data`, `error`, `timestamp` fields

**NFR-002**: Data Persistence
- SQLite database persists to `~/.openlog/openlog.db`
- Images persist to disk at `~/.openlog/images`

**NFR-003**: Input Validation
- All user input validated with Zod before processing
- Clear error messages for validation failures

**NFR-004**: Performance
- Database queries optimized for common operations
- Image serving efficient (appropriate caching headers)

**NFR-005**: Developer Experience
- TypeScript for type safety
- Clear error handling and logging
- Consistent code organization

### Acceptance Criteria

- [x] Project initialization with all dependencies installed
- [x] Directory structure created (`~/.openlog/`, `src/`, `db/`, `api/`, `utils/`)
- [x] SQLite database and schema initialized
- [x] Projects CRUD API endpoints working
- [x] Log Entries CRUD API endpoints working
- [x] Image upload and retrieval working
- [x] Pagination implemented on list endpoints
- [x] Search/filter by date and keywords working
- [x] Input validation with Zod on all endpoints
- [x] Consistent error handling across API
- [x] API can be started and responds to requests

---

## Technical Approach

### Architecture Overview

```
openlog/
├── src/
│   ├── index.ts                 # Hono app entry point
│   ├── middleware/              # Request/response middleware
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── responseFormatter.ts # Consistent response format
│   │   └── validation.ts        # Request validation
│   ├── routes/                  # API route handlers
│   │   ├── projects.ts          # Project CRUD routes
│   │   └── entries.ts           # Log entry CRUD routes
│   ├── db/                      # Database layer
│   │   ├── init.ts              # Initialize DB and schema
│   │   ├── schema.ts            # Database schema
│   │   ├── projects.ts          # Project queries
│   │   └── entries.ts           # Entry queries
│   ├── services/                # Business logic
│   │   ├── projectService.ts    # Project operations
│   │   ├── entryService.ts      # Entry operations
│   │   └── imageService.ts      # Image handling
│   ├── types/                   # TypeScript types
│   │   ├── models.ts            # Data models
│   │   └── api.ts               # API request/response types
│   ├── schemas/                 # Zod validation schemas
│   │   ├── project.ts           # Project validation
│   │   └── entry.ts             # Entry validation
│   └── utils/                   # Utilities
│       ├── constants.ts         # App constants
│       ├── paths.ts             # File path utilities
│       └── logger.ts            # Logging utility
├── db/
│   └── openlog.db               # SQLite database (auto-created)
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

### Data Model

**Projects Table**
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL,
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

**LogEntries Table**
```sql
CREATE TABLE logEntries (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  content TEXT NOT NULL,
  imagePath TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

### API Endpoints

#### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects` | List all projects (paginated) |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

#### Log Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:projectId/entries` | Create log entry |
| GET | `/api/projects/:projectId/entries` | List entries (paginated, filterable) |
| GET | `/api/projects/:projectId/entries/:entryId` | Get single entry |
| PUT | `/api/projects/:projectId/entries/:entryId` | Update entry |
| DELETE | `/api/projects/:projectId/entries/:entryId` | Delete entry |

#### Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:projectId/entries/:entryId/image` | Upload image |
| GET | `/api/images/:projectId/:filename` | Serve image |

### Response Format

All API responses follow this standard structure:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Implementation Plan

### Phase 1: Project Setup & Dependencies (Estimated: 1 hour)

**Objective**: Initialize the project with all required dependencies and configuration files.

**Tasks**:

1. **Initialize Node.js Project** (Est: 15 mins)
   - File: `package.json`
   - Action: Create
   - Commands:
     ```bash
     npm init -y
     npm install hono better-sqlite3 zod tsx
     npm install -D typescript @types/node @types/better-sqlite3
     ```
   - Details: Set up package.json with all dependencies

2. **Configure TypeScript** (Est: 15 mins)
   - File: `tsconfig.json`
   - Action: Create
   - Configuration:
     ```json
     {
       "compilerOptions": {
         "target": "ES2020",
         "module": "ESNext",
         "lib": ["ES2020"],
         "outDir": "./dist",
         "rootDir": "./src",
         "strict": true,
         "esModuleInterop": true,
         "skipLibCheck": true,
         "forceConsistentCasingInFileNames": true,
         "resolveJsonModule": true,
         "declaration": true,
         "declarationMap": true,
         "sourceMap": true,
         "moduleResolution": "node"
       },
       "include": ["src"],
       "exclude": ["node_modules", "dist"]
     }
     ```

3. **Create Environment & Build Config** (Est: 15 mins)
   - Files: `.env.example`, `.gitignore`
   - Action: Create
   - Details:
     ```env
     # .env.example
     NODE_ENV=development
     PORT=3000
     ```
     ```
     # .gitignore
     node_modules/
     dist/
     .env
     .DS_Store
     *.db
     ```

4. **Setup Development Scripts** (Est: 15 mins)
   - File: `package.json`
   - Action: Modify (add scripts)
   - Scripts:
     ```json
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js"
     }
     ```

**Deliverables**:
- [x] `package.json` with all dependencies
- [x] `tsconfig.json` configured
- [x] `.env.example` created
- [x] `.gitignore` created
- [x] Scripts ready for dev and build

**Dependencies**: None

---

### Phase 2: Directory Structure & Database Initialization (Estimated: 1.5 hours)

**Objective**: Set up file system directories and initialize SQLite database with schema.

**Tasks**:

1. **Create Utility for Directory Setup** (Est: 30 mins)
   - File: `src/utils/paths.ts`
   - Action: Create
   - Details:
     - Export home directory paths
     - Create `~/.openlog/` directory if doesn't exist
     - Create `~/.openlog/images/` directory if doesn't exist
     - Export paths for database and images folder
     ```typescript
     import { homedir } from 'os';
     import { mkdirSync, existsSync } from 'fs';
     import { join } from 'path';
     
     export const OPENLOG_HOME = join(homedir(), '.openlog');
     export const OPENLOG_DB = join(OPENLOG_HOME, 'openlog.db');
     export const OPENLOG_IMAGES = join(OPENLOG_HOME, 'images');
     
     export function ensureDirectories() {
       [OPENLOG_HOME, OPENLOG_IMAGES].forEach(dir => {
         if (!existsSync(dir)) {
           mkdirSync(dir, { recursive: true });
         }
       });
     }
     ```

2. **Create Database Schema** (Est: 30 mins)
   - File: `src/db/schema.ts`
   - Action: Create
   - Details:
     - Define SQL schema for projects and logEntries tables
     - Include all columns with proper types
     - Set up foreign key relationships
     ```typescript
     export const SCHEMA = `
       CREATE TABLE IF NOT EXISTS projects (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL UNIQUE,
         path TEXT NOT NULL,
         description TEXT,
         createdAt TEXT NOT NULL,
         updatedAt TEXT NOT NULL
       );
       
       CREATE TABLE IF NOT EXISTS logEntries (
         id TEXT PRIMARY KEY,
         projectId TEXT NOT NULL,
         content TEXT NOT NULL,
         imagePath TEXT,
         createdAt TEXT NOT NULL,
         updatedAt TEXT NOT NULL,
         FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
       );
     `;
     ```

3. **Create Database Initialization** (Est: 30 mins)
   - File: `src/db/init.ts`
   - Action: Create
   - Details:
     - Connect to SQLite using better-sqlite3
     - Run schema creation
     - Enable foreign keys
     - Export database instance
     ```typescript
     import Database from 'better-sqlite3';
     import { OPENLOG_DB, ensureDirectories } from '../utils/paths';
     import { SCHEMA } from './schema';
     
     export function initializeDatabase() {
       ensureDirectories();
       const db = new Database(OPENLOG_DB);
       db.pragma('foreign_keys = ON');
       db.exec(SCHEMA);
       return db;
     }
     
     export let dbInstance: Database.Database;
     
     export function setDatabase(db: Database.Database) {
       dbInstance = db;
     }
     
     export function getDatabase() {
       return dbInstance;
     }
     ```

4. **Create Constants & Logger** (Est: 30 mins)
   - Files: `src/utils/constants.ts`, `src/utils/logger.ts`
   - Action: Create
   - Details:
     - Constants for error codes, pagination defaults, etc.
     - Simple logger for debugging
     ```typescript
     // constants.ts
     export const ERROR_CODES = {
       PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
       ENTRY_NOT_FOUND: 'ENTRY_NOT_FOUND',
       VALIDATION_ERROR: 'VALIDATION_ERROR',
       DUPLICATE_PROJECT: 'DUPLICATE_PROJECT',
       INTERNAL_ERROR: 'INTERNAL_ERROR',
     };
     
     export const PAGINATION = {
       DEFAULT_LIMIT: 10,
       MAX_LIMIT: 100,
     };
     ```

**Deliverables**:
- [x] `src/utils/paths.ts` created with directory setup
- [x] `src/db/schema.ts` created with table definitions
- [x] `src/db/init.ts` created with database initialization
- [x] `src/utils/constants.ts` and `src/utils/logger.ts` created
- [x] Database can be initialized and schema applied

**Dependencies**: Phase 1

---

### Phase 3: Types, Schemas & Middleware (Estimated: 1.5 hours)

**Objective**: Define TypeScript types, Zod validation schemas, and middleware for consistent request/response handling.

**Tasks**:

1. **Create Data Models** (Est: 30 mins)
   - File: `src/types/models.ts`
   - Action: Create
   - Details:
     - Define TypeScript interfaces for Project and LogEntry
     - Include all fields with proper types
     ```typescript
     export interface Project {
       id: string;
       name: string;
       path: string;
       description?: string;
       createdAt: string;
       updatedAt: string;
     }
     
     export interface LogEntry {
       id: string;
       projectId: string;
       content: string;
       imagePath?: string;
       createdAt: string;
       updatedAt: string;
     }
     
     export interface PaginatedResponse<T> {
       items: T[];
       total: number;
       page: number;
       limit: number;
     }
     ```

2. **Create Validation Schemas** (Est: 30 mins)
   - Files: `src/schemas/project.ts`, `src/schemas/entry.ts`
   - Action: Create
   - Details:
     - Zod schemas for creating/updating projects and entries
     - Validation for pagination parameters
     ```typescript
     // src/schemas/project.ts
     import { z } from 'zod';
     
     export const CreateProjectSchema = z.object({
       name: z.string().min(1).max(255),
       path: z.string().min(1),
       description: z.string().max(1000).optional(),
     });
     
     export const UpdateProjectSchema = z.object({
       name: z.string().min(1).max(255).optional(),
       description: z.string().max(1000).optional(),
     });
     ```

3. **Create API Request/Response Types** (Est: 30 mins)
   - File: `src/types/api.ts`
   - Action: Create
   - Details:
     - Define standard response envelope type
     - Error response types
     ```typescript
     export interface ApiResponse<T> {
       success: boolean;
       data: T | null;
       error: ErrorPayload | null;
       timestamp: string;
     }
     
     export interface ErrorPayload {
       code: string;
       message: string;
       details?: Record<string, any>;
     }
     ```

4. **Create Response Formatter Middleware** (Est: 30 mins)
   - File: `src/middleware/responseFormatter.ts`
   - Action: Create
   - Details:
     - Middleware to format all responses consistently
     - Add timestamp to all responses
     ```typescript
     import { HonoRequest } from 'hono';
     import { ApiResponse } from '../types/api';
     
     export function formatResponse<T>(
       data: T,
       success = true,
       error = null
     ): ApiResponse<T> {
       return {
         success,
         data: success ? data : null,
         error,
         timestamp: new Date().toISOString(),
       };
     }
     ```

5. **Create Error Handler Middleware** (Est: 30 mins)
   - File: `src/middleware/errorHandler.ts`
   - Action: Create
   - Details:
     - Global error handler for Hono
     - Catch validation errors, database errors, etc.
     - Return consistent error response

**Deliverables**:
- [x] `src/types/models.ts` with Project and LogEntry interfaces
- [x] `src/types/api.ts` with response envelope types
- [x] `src/schemas/project.ts` with Zod validation
- [x] `src/schemas/entry.ts` with Zod validation
- [x] `src/middleware/responseFormatter.ts` created
- [x] `src/middleware/errorHandler.ts` created

**Dependencies**: Phase 1

---

### Phase 4: Database Query Layer (Estimated: 2 hours)

**Objective**: Create query functions for reading/writing projects and entries to SQLite.

**Tasks**:

1. **Create Project Queries** (Est: 1 hour)
   - File: `src/db/projects.ts`
   - Action: Create
   - Details:
     - Implement CRUD operations: create, read, list, update, delete
     - Handle pagination
     - Use prepared statements for safety
     ```typescript
     import { getDatabase } from './init';
     import { Project } from '../types/models';
     import { randomUUID } from 'crypto';
     
     export function createProject(input: {
       name: string;
       path: string;
       description?: string;
     }): Project {
       const db = getDatabase();
       const id = randomUUID();
       const now = new Date().toISOString();
       
       const stmt = db.prepare(`
         INSERT INTO projects (id, name, path, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)
       `);
       
       stmt.run(id, input.name, input.path, input.description || null, now, now);
       
       return {
         id,
         name: input.name,
         path: input.path,
         description: input.description,
         createdAt: now,
         updatedAt: now,
       };
     }
     
     export function getProjectById(id: string): Project | null {
       const db = getDatabase();
       const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
       return stmt.get(id) as Project | undefined || null;
     }
     
     export function listProjects(limit: number, offset: number) {
       const db = getDatabase();
       const items = db.prepare(`
         SELECT * FROM projects ORDER BY createdAt DESC LIMIT ? OFFSET ?
       `).all(limit, offset) as Project[];
       
       const total = (db.prepare('SELECT COUNT(*) as count FROM projects')
         .get() as { count: number }).count;
       
       return { items, total };
     }
     
     export function updateProject(
       id: string,
       updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
     ): Project | null {
       const db = getDatabase();
       const existing = getProjectById(id);
       if (!existing) return null;
       
       const now = new Date().toISOString();
       const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
       const values = [...Object.values(updates), now, id];
       
       db.prepare(`UPDATE projects SET ${fields}, updatedAt = ? WHERE id = ?`)
         .run(...values);
       
       return getProjectById(id);
     }
     
     export function deleteProject(id: string): boolean {
       const db = getDatabase();
       const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
       const result = stmt.run(id);
       return result.changes > 0;
     }
     ```

2. **Create Entry Queries** (Est: 1 hour)
   - File: `src/db/entries.ts`
   - Action: Create
   - Details:
     - Implement CRUD operations for log entries
     - Support filtering by date range and keywords
     - Handle pagination
     ```typescript
     import { getDatabase } from './init';
     import { LogEntry } from '../types/models';
     import { randomUUID } from 'crypto';
     
     export function createEntry(input: {
       projectId: string;
       content: string;
       imagePath?: string;
     }): LogEntry {
       const db = getDatabase();
       const id = randomUUID();
       const now = new Date().toISOString();
       
       const stmt = db.prepare(`
         INSERT INTO logEntries (id, projectId, content, imagePath, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)
       `);
       
       stmt.run(id, input.projectId, input.content, input.imagePath || null, now, now);
       
       return {
         id,
         projectId: input.projectId,
         content: input.content,
         imagePath: input.imagePath,
         createdAt: now,
         updatedAt: now,
       };
     }
     
     export function getEntryById(id: string): LogEntry | null {
       const db = getDatabase();
       const stmt = db.prepare('SELECT * FROM logEntries WHERE id = ?');
       return stmt.get(id) as LogEntry | undefined || null;
     }
     
     export function listEntriesByProject(
       projectId: string,
       limit: number,
       offset: number,
       filters?: { startDate?: string; endDate?: string; keyword?: string }
     ) {
       const db = getDatabase();
       let query = 'SELECT * FROM logEntries WHERE projectId = ?';
       const params: any[] = [projectId];
       
       if (filters?.startDate) {
         query += ' AND createdAt >= ?';
         params.push(filters.startDate);
       }
       if (filters?.endDate) {
         query += ' AND createdAt <= ?';
         params.push(filters.endDate);
       }
       if (filters?.keyword) {
         query += ' AND content LIKE ?';
         params.push(`%${filters.keyword}%`);
       }
       
       query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
       params.push(limit, offset);
       
       const items = db.prepare(query).all(...params) as LogEntry[];
       
       let countQuery = 'SELECT COUNT(*) as count FROM logEntries WHERE projectId = ?';
       const countParams = [projectId];
       if (filters?.startDate) {
         countQuery += ' AND createdAt >= ?';
         countParams.push(filters.startDate);
       }
       if (filters?.endDate) {
         countQuery += ' AND createdAt <= ?';
         countParams.push(filters.endDate);
       }
       if (filters?.keyword) {
         countQuery += ' AND content LIKE ?';
         countParams.push(`%${filters.keyword}%`);
       }
       
       const total = (db.prepare(countQuery).get(...countParams) as { count: number }).count;
       
       return { items, total };
     }
     
     export function updateEntry(
       id: string,
       updates: Partial<Omit<LogEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
     ): LogEntry | null {
       const db = getDatabase();
       const existing = getEntryById(id);
       if (!existing) return null;
       
       const now = new Date().toISOString();
       const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
       const values = [...Object.values(updates), now, id];
       
       db.prepare(`UPDATE logEntries SET ${fields}, updatedAt = ? WHERE id = ?`)
         .run(...values);
       
       return getEntryById(id);
     }
     
     export function deleteEntry(id: string): boolean {
       const db = getDatabase();
       const stmt = db.prepare('DELETE FROM logEntries WHERE id = ?');
       const result = stmt.run(id);
       return result.changes > 0;
     }
     
     export function deleteEntriesByProject(projectId: string): number {
       const db = getDatabase();
       const stmt = db.prepare('DELETE FROM logEntries WHERE projectId = ?');
       const result = stmt.run(projectId);
       return result.changes;
     }
     ```

**Deliverables**:
- [x] `src/db/projects.ts` with all project query functions
- [x] `src/db/entries.ts` with all entry query functions
- [x] Prepared statements used throughout
- [x] Pagination support verified
- [x] Filter queries working

**Dependencies**: Phase 2

---

### Phase 5: Service Layer (Estimated: 1.5 hours)

**Objective**: Create business logic layer to handle operations with validation and error handling.

**Tasks**:

1. **Create Project Service** (Est: 45 mins)
   - File: `src/services/projectService.ts`
   - Action: Create
   - Details:
     - Wrap project queries with business logic
     - Handle validation and error cases
     - Throw descriptive errors for use in routes

2. **Create Entry Service** (Est: 45 mins)
   - File: `src/services/entryService.ts`
   - Action: Create
   - Details:
     - Wrap entry queries with business logic
     - Support filtering and search
     - Coordinate with image service

3. **Create Image Service** (Est: 30 mins)
   - File: `src/services/imageService.ts`
   - Action: Create
   - Details:
     - Handle image upload to `~/.openlog/images/{projectId}/`
     - Generate unique filenames with timestamp
     - Delete images when entry is deleted
     - Validate image file types

**Deliverables**:
- [x] `src/services/projectService.ts` created
- [x] `src/services/entryService.ts` created
- [x] `src/services/imageService.ts` created
- [x] All services handle errors appropriately

**Dependencies**: Phase 4

---

### Phase 6: API Routes - Projects (Estimated: 1 hour)

**Objective**: Implement REST API endpoints for project CRUD operations.

**Tasks**:

1. **Create Project Routes** (Est: 1 hour)
   - File: `src/routes/projects.ts`
   - Action: Create
   - Details:
     - POST `/api/projects` - Create project
     - GET `/api/projects` - List projects (paginated)
     - GET `/api/projects/:id` - Get single project
     - PUT `/api/projects/:id` - Update project
     - DELETE `/api/projects/:id` - Delete project
     - All endpoints use response formatter and error handler
     - All endpoints validate input with Zod schemas

**Deliverables**:
- [x] All 5 project endpoints implemented
- [x] Input validation with Zod
- [x] Proper HTTP status codes
- [x] Consistent error responses

**Dependencies**: Phase 5

---

### Phase 7: API Routes - Log Entries (Estimated: 1.5 hours)

**Objective**: Implement REST API endpoints for log entry CRUD and related operations.

**Tasks**:

1. **Create Entry Routes** (Est: 1 hour)
   - File: `src/routes/entries.ts`
   - Action: Create
   - Details:
     - POST `/api/projects/:projectId/entries` - Create entry
     - GET `/api/projects/:projectId/entries` - List entries (paginated, filterable)
     - GET `/api/projects/:projectId/entries/:entryId` - Get single entry
     - PUT `/api/projects/:projectId/entries/:entryId` - Update entry
     - DELETE `/api/projects/:projectId/entries/:entryId` - Delete entry
     - Support query filters: startDate, endDate, keyword

2. **Create Image Upload Route** (Est: 30 mins)
   - File: `src/routes/entries.ts` (extend)
   - Action: Modify
   - Details:
     - POST `/api/projects/:projectId/entries/:entryId/image` - Upload image
     - Multipart form data handling
     - Store image with timestamp-based filename
     - Update entry with image path
     - Validate image file types

**Deliverables**:
- [x] All 5 entry endpoints implemented
- [x] Image upload endpoint working
- [x] Date filtering working
- [x] Keyword search working
- [x] Pagination working on list endpoint

**Dependencies**: Phase 6

---

### Phase 8: Image Serving & Entry Point (Estimated: 1 hour)

**Objective**: Add image serving endpoint and create main application entry point.

**Tasks**:

1. **Create Image Serving Route** (Est: 30 mins)
   - File: `src/routes/images.ts`
   - Action: Create
   - Details:
     - GET `/api/images/:projectId/:filename` - Serve stored image
     - Validate file exists before serving
     - Set appropriate content-type headers
     - Set cache headers for images

2. **Create Main Application Entry Point** (Est: 30 mins)
   - File: `src/index.ts`
   - Action: Create
   - Details:
     - Initialize Hono app
     - Initialize database
     - Register middleware (error handler, response formatter)
     - Register all route handlers
     - Start server on PORT (default 3000)
     ```typescript
     import { Hono } from 'hono';
     import { cors } from 'hono/cors';
     import { initializeDatabase, setDatabase } from './db/init';
     import projectRoutes from './routes/projects';
     import entryRoutes from './routes/entries';
     import imageRoutes from './routes/images';
     
     const app = new Hono();
     
     // Initialize database
     const db = initializeDatabase();
     setDatabase(db);
     
     // Middleware
     app.use('*', cors());
     
     // Routes
     app.route('/api', projectRoutes);
     app.route('/api', entryRoutes);
     app.route('/api', imageRoutes);
     
     // Health check
     app.get('/health', (c) => c.json({ status: 'ok' }));
     
     const port = process.env.PORT || 3000;
     export default app;
     ```

**Deliverables**:
- [x] `src/routes/images.ts` created with image serving
- [x] `src/index.ts` created as app entry point
- [x] All routes registered
- [x] Middleware applied globally
- [x] Server starts successfully

**Dependencies**: Phase 7

---

### Phase 9: Testing & Validation (Estimated: 2 hours)

**Objective**: Test all API endpoints and verify functionality.

**Tasks**:

1. **Manual API Testing** (Est: 1 hour)
   - Test each endpoint with curl or Postman:
     - Create project, verify response format
     - List projects, verify pagination
     - Create entry with content
     - Upload image to entry
     - Retrieve image
     - Filter entries by date and keyword
     - Update project/entry
     - Delete entry and verify image deleted
     - Delete project and verify cascading delete

2. **Error Handling Testing** (Est: 30 mins)
   - Test validation errors (invalid input)
   - Test not found errors (invalid IDs)
   - Test duplicate project names
   - Verify error response format

3. **Data Persistence Testing** (Est: 30 mins)
   - Verify database created in `~/.openlog/`
   - Verify images stored in `~/.openlog/images/`
   - Restart server and verify data persists

**Deliverables**:
- [x] All CRUD operations verified working
- [x] Pagination working correctly
- [x] Filtering and search working
- [x] Image upload/retrieval working
- [x] Cascading delete working
- [x] Error responses consistent
- [x] Data persists after restart

**Dependencies**: Phase 8

---

## File Changes Summary

### Files to Create

#### Configuration
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore patterns

#### Utils & Constants
- `src/utils/paths.ts` - Directory path utilities
- `src/utils/constants.ts` - App constants
- `src/utils/logger.ts` - Logging utility

#### Database Layer
- `src/db/schema.ts` - SQL schema definitions
- `src/db/init.ts` - Database initialization
- `src/db/projects.ts` - Project queries
- `src/db/entries.ts` - Entry queries

#### Types & Validation
- `src/types/models.ts` - TypeScript interfaces
- `src/types/api.ts` - API response types
- `src/schemas/project.ts` - Project validation schemas
- `src/schemas/entry.ts` - Entry validation schemas

#### Middleware
- `src/middleware/responseFormatter.ts` - Response formatting
- `src/middleware/errorHandler.ts` - Error handling

#### Services
- `src/services/projectService.ts` - Project business logic
- `src/services/entryService.ts` - Entry business logic
- `src/services/imageService.ts` - Image handling

#### Routes
- `src/routes/projects.ts` - Project endpoints
- `src/routes/entries.ts` - Entry endpoints and image upload
- `src/routes/images.ts` - Image serving

#### Entry Point
- `src/index.ts` - Main application entry point

---

## Dependencies & Integration

### External Dependencies

```json
{
  "dependencies": {
    "hono": "^4.x",
    "better-sqlite3": "^9.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/better-sqlite3": "^7.x",
    "tsx": "^4.x"
  }
}
```

### Internal Dependencies

- `src/index.ts` depends on all route modules and db/init
- Route modules depend on services
- Services depend on db query layer
- Query layer depends on db/init

### File System Dependencies

- Database: `~/.openlog/openlog.db`
- Images: `~/.openlog/images/`
- Paths created automatically on first run

---

## Risks & Considerations

### Technical Risks

1. **Synchronous SQLite Operations**: Using better-sqlite3 with synchronous APIs may block the event loop on heavy operations
   - Mitigation: Keep database operations simple; consider async wrapper if needed later

2. **Image Storage**: Images stored on local file system - not suitable for distributed deployments
   - Mitigation: Current design is for local/single-machine use; migration to cloud storage documented for future

3. **UUID Generation**: Using randomUUID from crypto for IDs
   - Mitigation: Sufficient for this use case; consider incremental IDs later if needed

4. **No Authentication**: API has no auth layer in this phase
   - Mitigation: This is planned for frontend phase; all users access same data for now

### Breaking Changes

None - this is the initial implementation.

### Data Migration

Not applicable - fresh database initialization.

---

## Testing Strategy

### Unit Tests (Future)

When adding tests, focus on:
- Service layer validation logic
- Image filename generation
- Query parameter parsing for filters

### Integration Tests (Future)

- Full workflows: Create project → Create entry → Upload image → Retrieve
- Filter and pagination edge cases
- Cascading delete verification

### Manual Testing Checklist

- [x] `npm install` succeeds
- [x] `npm run dev` starts server on port 3000
- [x] GET `/health` returns `{ status: 'ok' }`
- [x] POST `/api/projects` creates project
- [x] GET `/api/projects` lists projects
- [x] GET `/api/projects/:id` retrieves single project
- [x] PUT `/api/projects/:id` updates project
- [x] DELETE `/api/projects/:id` deletes project
- [x] POST `/api/projects/:id/entries` creates entry
- [x] GET `/api/projects/:id/entries` lists entries
- [x] GET `/api/projects/:id/entries/:entryId` retrieves entry
- [x] POST `/api/projects/:id/entries/:entryId/image` uploads image
- [x] GET `/api/images/:projectId/:filename` serves image
- [x] GET `/api/projects/:id/entries?keyword=test` filters by keyword
- [x] GET `/api/projects/:id/entries?page=1&limit=5` paginates
- [x] DELETE `/api/projects/:id/entries/:entryId` deletes entry
- [x] Verify cascading delete when project deleted
- [x] Verify images stored in `~/.openlog/images/`
- [x] Verify database created in `~/.openlog/`

---

## Rollout Plan

### Prerequisites

- Node.js v18+ installed
- npm available
- Write access to home directory

### Development Environment Setup

```bash
# Clone/setup project
cd openlog

# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Environment Variables

```bash
# Create .env from .env.example
cp .env.example .env

# Optional: Override default port
PORT=3001
```

### Deployment Considerations

- **Build**: Run `npm run build` to compile TypeScript to `dist/`
- **Start**: Use `node dist/index.js` to run built version
- **Database**: Ensure `~/.openlog/` directory writable
- **Images**: Ensure `~/.openlog/images/` directory writable and has sufficient disk space

---

## Success Metrics

How to measure if implementation is successful:

1. **Functionality**: All 5 project + 5 entry CRUD endpoints working
2. **Data Persistence**: Data survives server restart
3. **Performance**: Responses under 100ms on local machine
4. **Code Quality**: TypeScript strict mode passes, no linter errors
5. **API Consistency**: All responses follow standard format
6. **Error Handling**: All error cases return proper error responses
7. **Image Storage**: Images stored correctly, retrievable, deleted on entry delete

---

## Open Questions

- **Frontend Framework**: What frontend will call this API? (To be determined)
- **Authentication**: Who defines/manages user context? (Future phase)
- **Rate Limiting**: Should we add rate limiting in Phase 1? (Recommend Phase 2)
- **Logging**: Should we add structured logging? (Recommend Phase 2)

---

## References

### Relevant Documentation

- [Hono Documentation](https://hono.dev/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Zod Documentation](https://zod.dev/)

### Related Standards

- REST API Best Practices
- SQLite Best Practices for Local Development

---

## Appendix

### Code Patterns to Follow

Based on the analysis, follow these patterns:

**TypeScript Strictness**:
- Use strict mode throughout
- Type all function parameters and returns
- Avoid `any` type

**Error Handling**:
- Use try-catch in services
- Throw descriptive errors with codes
- Let middleware format error responses

**Database Operations**:
- Always use prepared statements
- Use `.all()` for multiple rows
- Use `.get()` for single row
- Check results before processing

**API Responses**:
```typescript
// Success
{ success: true, data: {...}, error: null, timestamp: "..." }

// Error
{ success: false, data: null, error: { code: "...", message: "...", details: {...} }, timestamp: "..." }
```

### Naming Conventions

- **Files**: kebab-case (e.g., `project-routes.ts` or `projectRoutes.ts`)
- **Classes**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database Tables**: camelCase plural (logEntries, projects)
- **Database Columns**: camelCase (projectId, createdAt)
- **Routes**: lowercase with slashes (e.g., `/api/projects/:id`)

### Project ID Structure

- Use UUID v4 for all IDs (project IDs, entry IDs)
- Image paths use projectId and timestamp: `{projectId}/{timestamp}_{filename}`
- Timestamps use ISO 8601 format: `2024-01-15T10:30:00.000Z`

---

## Next Steps After Backend

1. **Frontend Development**: Create web/mobile UI to consume these APIs
2. **Authentication Layer**: Add user/project ownership tracking
3. **Advanced Features**: Tags, sharing, analytics
4. **DevOps**: Docker containerization, deployment automation
5. **Database Migration**: Migrate to PostgreSQL for production if needed

