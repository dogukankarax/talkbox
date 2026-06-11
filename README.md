# Talkbox

Real-time chat with channels, roles and online presence. React 19 + Express 5 + Socket.io, type-safe end to end.

Live: https://talkbox-78j.pages.dev

![Talkbox chat view](docs/chat.png)

## What it does

- Channels with invite codes — create one, share the code, others join
- Real-time messaging over Socket.io, one room per channel
- Online presence: see who is connected, live
- Channel admins can rename or delete the channel and promote, demote or remove members
- Drag-and-drop channel reordering, persisted per user
- JWT auth with bcrypt-hashed passwords
- The same Zod schemas validate forms on the client and requests on the server

## Screenshots

![Login screen](docs/login.png)

## Architecture

A pnpm workspace with three packages: `backend` (Express 5 API + Socket.io gateway), `frontend` (Vite + React 19 SPA) and `shared` (TypeScript types both sides import). REST handles auth and channel CRUD, Socket.io handles messages and presence. Messages live in Postgres via Drizzle; presence is an in-memory map on the server.

API routes are in `backend/src/routes`, socket events in `backend/src/socket`.

## Stack

Backend: Express 5, Socket.io, Drizzle ORM, Postgres, Zod, pino.
Frontend: React 19 (with the compiler), TanStack Router/Query/Form, Tailwind 4, Zustand, dnd-kit.

## Run locally

Needs Node 20+, pnpm and a Postgres database (local or [Neon](https://neon.tech)).

```bash
git clone https://github.com/dogukankarax/talkbox.git
cd talkbox
pnpm install
cp backend/.env.example backend/.env     # then fill in the values
cp frontend/.env.example frontend/.env
cd backend && pnpm db:push               # creates the tables
cd .. && pnpm dev
```

Backend runs on `:3000`, frontend on `:5173`. Tests: `pnpm test` inside `backend/`.

## Environment

| Var | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | backend | Postgres connection string |
| `JWT_SECRET` | backend | Token signing secret — any long random string |
| `CLIENT_ORIGIN` | backend | Allowed CORS origin (default `http://localhost:5173`) |
| `PORT` | backend | HTTP port (default `3000`) |
| `VITE_API_URL` | frontend | API base URL, e.g. `http://localhost:3000/api` |

## License

[MIT](./LICENSE)
