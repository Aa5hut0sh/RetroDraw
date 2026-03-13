# RetroDraw

A real-time collaborative whiteboard application with a retro aesthetic. Sketch ideas, create diagrams, and brainstorm together on an infinite canvas — all synced live across every connected user.

## Features

- ✏️ **Rich drawing tools** — pencil, rectangle, circle, line, arrow, diamond, and text
- 👥 **Live collaboration** — multiple users draw simultaneously in shared rooms
- 🔐 **Authentication** — sign up / sign in with email and password (JWT-secured)
- 🎨 **Retro UI** — hand-drawn, vintage-style interface
- ♾️ **Infinite canvas** — pan and sketch without limits
- 💾 **Persistent shapes** — drawings are stored in PostgreSQL and restored on reconnect

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│               Frontend (Next.js / React)                 │
│         [Canvas] ←→ [useSocket Hook]                     │
└──────────────────┬──────────────────────┬───────────────┘
                   │                      │
                   ▼                      ▼
         ┌─────────────────┐   ┌──────────────────────┐
         │  HTTP Backend   │   │   WebSocket Backend  │
         │  Express / Bun  │   │   Express + ws / Bun │
         │  Port 3001      │   │   Port 3002           │
         │  - Auth routes  │   │  - Real-time sync     │
         │  - JWT tokens   │   │  - Room management    │
         └────────┬────────┘   └──────────┬────────────┘
                  │                       │
                  └───────────┬───────────┘
                              ▼
                   ┌─────────────────────┐
                   │   PostgreSQL        │
                   │   (Prisma ORM)      │
                   │   Users · Rooms     │
                   │   Shapes (Chat mdl) │
                   └─────────────────────┘
```

**Data flow:**
1. User signs up / signs in → HTTP backend validates credentials and returns a JWT.
2. User creates or joins a room → room record stored in the database.
3. User draws on the canvas → shape data sent over WebSocket.
4. WebSocket backend broadcasts the shape to every other user in the room and persists it to the database.
5. Erase events delete shapes from the database and broadcast the deletion to the room.

## Monorepo Structure

```
RetroDraw/
├── apps/
│   ├── http-backend/      # REST API (Express, Bun, port 3001)
│   ├── web/               # Frontend (Next.js 16, React 19, Tailwind)
│   └── ws-backend/        # WebSocket server (ws, Bun, port 3002)
├── packages/
│   ├── common/            # Shared Zod validation schemas
│   ├── database/          # Prisma client & schema
│   ├── eslint-config/     # Shared ESLint configuration
│   ├── typescript-config/ # Shared tsconfig files
│   └── ui/                # Shared React component library
├── dockerfile/            # Per-service Dockerfiles
├── docker-compose.yml     # Container orchestration
└── turbo.json             # Turborepo task configuration
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI |
| HTTP Backend | Bun, Express 5, JWT, bcrypt |
| WebSocket Backend | Bun, Express, ws |
| Database | PostgreSQL, Prisma ORM |
| Monorepo | Turborepo, Bun workspaces |
| Validation | Zod |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.3.3
- PostgreSQL database (or Docker)

### Environment variables

Create a `.env` file in the repo root (and in each app that needs it) with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/retrodraw
JWT_SECRET=your_jwt_secret

# Required for the frontend build
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

### Install dependencies

```bash
bun install
```

### Database setup

```bash
cd packages/database
bunx prisma migrate dev
```

### Run in development

```bash
# Start all apps concurrently
bun run dev
```

Or start individual services:

```bash
bun run dev --filter=web          # Frontend on http://localhost:3000
bun run dev --filter=http-backend # REST API on http://localhost:3001
bun run dev --filter=ws-backend   # WebSocket server on ws://localhost:3002
```

### Build for production

```bash
bun run build
```

## Docker

Bring up all three services with Docker Compose:

```bash
docker-compose up --build
```

The following ports will be exposed: `3000` (web), `3001` (http-backend), `3002` (ws-backend).

## Database Schema

| Model | Key fields |
|---|---|
| `User` | `id` (UUID), `email` (unique), `password` (hashed), `name`, `photo?` |
| `Room` | `id`, `slug` (unique), `secret`, `adminId` |
| `Chat` | `id`, `roomId`, `userId`, `message` (serialised shape JSON) |

## Contributing

1. Fork the repository and create a feature branch.
2. Run `bun install` and ensure existing checks pass (`bun run lint`, `bun run build`).
3. Submit a pull request describing your changes.
