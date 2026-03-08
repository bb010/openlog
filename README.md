# OpenLog Backend

A logging and build-sharing platform API built with Hono, SQLite, and TypeScript.

## Quick Start

### Prerequisites
- Node.js 24+ (for built-in SQLite support)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start at `http://localhost:3000` and watch for file changes.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
src/
├── index.ts                 # Main app entry point
├── db/                      # Database layer
│   ├── init.ts             # Database initialization
│   ├── schema.ts           # SQL schema
│   ├── projects.ts         # Project queries
│   └── entries.ts          # Entry queries
├── middleware/             # Hono middleware
│   ├── errorHandler.ts     # Error handling
│   └── responseFormatter.ts # Response formatting
├── routes/                 # API routes
│   ├── projects.ts         # Project endpoints
│   ├── entries.ts          # Entry endpoints
│   └── images.ts           # Image endpoints
├── services/               # Business logic
│   ├── projectService.ts   # Project operations
│   ├── entryService.ts     # Entry operations
│   └── imageService.ts     # Image handling
├── schemas/                # Zod validation
│   ├── project.ts          # Project validation
│   └── entry.ts            # Entry validation
├── types/                  # TypeScript types
│   ├── models.ts           # Data models
│   └── api.ts              # API response types
└── utils/                  # Utilities
    ├── constants.ts        # Constants
    ├── logger.ts           # Logging
    └── paths.ts            # Path utilities
```

## Storage Locations

- **Database**: `~/.openlog/openlog.db`
- **Images**: `~/.openlog/images/{projectId}/{timestamp}_{filename}`

## API Endpoints

### Projects

- `POST /api/projects` - Create project
- `GET /api/projects` - List projects (paginated)
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Entries

- `POST /api/projects/:projectId/entries` - Create entry
- `GET /api/projects/:projectId/entries` - List entries (paginated, filterable)
- `GET /api/projects/:projectId/entries/:entryId` - Get entry
- `PUT /api/projects/:projectId/entries/:entryId` - Update entry
- `DELETE /api/projects/:projectId/entries/:entryId` - Delete entry

### Images

- `POST /api/projects/:projectId/entries/:entryId/image` - Upload image
- `GET /api/images/:projectId/:filename` - Retrieve image

## Response Format

All responses follow a standard format:

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
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Technology Stack

- **Framework**: [Hono](https://hono.dev/)
- **Database**: SQLite (node:sqlite built-in module)
- **Runtime**: Node.js with tsx
- **Validation**: [Zod](https://zod.dev/)
- **Language**: TypeScript

## Development Notes

- Uses Node.js built-in SQLite module (requires `--experimental-sqlite` flag)
- Synchronous database operations for simplicity
- Prepared statements for SQL injection prevention
- Foreign key constraints enabled
- WAL mode for concurrent access

## License

MIT
