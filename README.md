<div align="center">

# 💬 Talkbox

**Real-time chat with channels, roles and presence — built with a fully type-safe React 19 + Express 5 + Socket.io stack.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

### [🚀 Live Demo →](https://talkbox-78j.pages.dev)

</div>

![Talkbox chat view](docs/chat.png)

<details>
<summary>📸 More screenshots</summary>

![Login screen](docs/login.png)

</details>

---

## ✨ Features

- 🔐 **JWT authentication** with bcrypt-hashed passwords and a protected `/me` endpoint
- 📡 **Real-time messaging** over Socket.io with per-channel rooms
- 🟢 **Presence tracking** — see which members are online live
- 🧑‍🤝‍🧑 **Role-based channel admin** — promote, demote and remove members
- 🔗 **Invite codes** for joining private channels (`nanoid`)
- 🪄 **Drag-and-drop channel reordering** (persisted per user via Zustand)
- 🎨 **Neon-themed UI** with Tailwind 4, dark-first design and motion transitions
- 📱 **Responsive layout** with collapsible sidebars on mobile
- 🛡 **End-to-end Zod validation** — same schemas inform the React Hook forms and the API handlers

---

## 🧱 Architecture

```
┌──────────────────────┐        REST        ┌──────────────────────┐        SQL        ┌──────────────┐
│      Browser         │ ─────────────────► │     Express 5        │ ────────────────► │  PostgreSQL  │
│                      │ ◄───────────────── │     + Socket.io      │ ◄──────────────── │  (Drizzle)   │
│  React 19            │                    │                      │                   │              │
│  TanStack Router     │     WebSocket      │  JWT auth middleware │                   └──────────────┘
│  TanStack Query      │ ◄═════════════════►│  Zod request schemas │
│  Tailwind 4          │   (Socket.io)      │  In-memory presence  │
│  Zustand · dnd-kit   │                    │                      │
└──────────────────────┘                    └──────────────────────┘
            ▲                                           ▲
            └─────────────── @talkbox/shared types ─────┘
```

A pnpm workspace ties three packages together:

| Package            | Role                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `@talkbox/backend` | Express 5 API + Socket.io gateway, Drizzle migrations, JWT middleware |
| `@talkbox/frontend`| Vite + React 19 SPA, file-based routing via TanStack Router           |
| `@talkbox/shared`  | Cross-package TypeScript types consumed by both ends                  |

---

## 🛠 Tech Stack

**Backend** — Express 5 · Socket.io · Drizzle ORM · PostgreSQL · JWT · bcrypt · Zod · nanoid · tsx · helmet · express-rate-limit · pino

**Frontend** — React 19 (with React Compiler) · TanStack Router · TanStack Query · TanStack Form · Tailwind CSS 4 · Zustand · dnd-kit · Motion · Sonner · Lucide

**Tooling** — pnpm workspaces · TypeScript · ESLint · Vite · drizzle-kit · Vitest · supertest

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+
- **PostgreSQL** 14+ (local install, Docker, or a hosted provider like [Neon](https://neon.tech/))

### 1. Clone and install

```bash
git clone https://github.com/dogukankarax/talkbox.git
cd talkbox
pnpm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in the values (see [Environment Variables](#-environment-variables) below).

### 3. Set up the database

```bash
cd backend
pnpm db:push     # creates all tables in your Postgres instance
```

### 4. Run the dev servers

From the repo root:

```bash
pnpm dev
```

This starts the backend on `http://localhost:3000` and the frontend on `http://localhost:5173` in parallel.

---

## 🔑 Environment Variables

### `backend/.env`

| Variable        | Required | Example                                         | Notes                                       |
| --------------- | :------: | ----------------------------------------------- | ------------------------------------------- |
| `DATABASE_URL`  |    ✅    | `postgresql://user:pass@host:5432/talkbox`      | Standard Postgres connection string         |
| `JWT_SECRET`    |    ✅    | `<64-byte hex string>`                          | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CLIENT_ORIGIN` |          | `http://localhost:5173`                         | CORS + Socket.io allowed origin             |
| `PORT`          |          | `3000`                                          | HTTP port                                   |

### `frontend/.env`

| Variable       | Required | Example                       | Notes                       |
| -------------- | :------: | ----------------------------- | --------------------------- |
| `VITE_API_URL` |    ✅    | `http://localhost:3000/api`   | Base URL of the Talkbox API |

---

## 📜 Scripts

From the **repo root**:

| Command       | What it does                                             |
| ------------- | -------------------------------------------------------- |
| `pnpm dev`    | Run backend + frontend concurrently                      |
| `pnpm build`  | Build all workspace packages                             |
| `pnpm lint`   | Lint all workspace packages                              |

From `backend/`:

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `pnpm dev`        | Start the API in watch mode (`tsx watch`)   |
| `pnpm start`      | Run the API once (used in production)       |
| `pnpm test`       | Run Vitest unit + integration tests         |
| `pnpm db:push`    | Sync schema to the database (no migrations) |
| `pnpm db:generate`| Generate a Drizzle migration                |
| `pnpm db:migrate` | Apply pending migrations                    |

From `frontend/`:

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start Vite dev server                     |
| `pnpm build`     | Type-check and build the production bundle|
| `pnpm preview`   | Preview the production build locally      |
| `pnpm lint`      | Run ESLint                                |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

### Auth

| Method | Path             | Description                       |
| :----: | ---------------- | --------------------------------- |
| `POST` | `/auth/register` | Create an account, returns a JWT  |
| `POST` | `/auth/login`    | Log in, returns a JWT             |
| `GET`  | `/auth/me`       | Current user profile              |

### Channels

| Method   | Path                                          | Description                          |
| :------: | --------------------------------------------- | ------------------------------------ |
| `GET`    | `/channels`                                   | List channels the user is a member of|
| `POST`   | `/channels`                                   | Create a channel (caller becomes admin) |
| `POST`   | `/channels/join`                              | Join via invite code                 |
| `PATCH`  | `/channels/:channelId`                        | Rename channel (admin only)          |
| `DELETE` | `/channels/:channelId`                        | Delete channel (admin only)          |
| `POST`   | `/channels/:channelId/leave`                  | Leave channel                        |
| `GET`    | `/channels/:channelId/members`                | List members                         |
| `DELETE` | `/channels/:channelId/members/:userId`        | Remove member (admin only)           |
| `PATCH`  | `/channels/:channelId/members/:userId/role`   | Promote / demote member (admin only) |

### Health

| Method | Path           | Description                |
| :----: | -------------- | -------------------------- |
| `GET`  | `/health`      | Liveness probe for hosting |

### Socket events

**Client → Server**

| Event           | Payload                                  |
| --------------- | ---------------------------------------- |
| `join_channel`  | `channelId: string`                      |
| `leave_channel` | `channelId: string`                      |
| `send_message`  | `{ channelId: string, content: string }` |

**Server → Client**

| Event                  | Payload                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `online_users`         | `string[]` — initial snapshot of online user ids             |
| `user_online`          | `userId: string`                                             |
| `user_offline`         | `userId: string`                                             |
| `new_message`          | `Message` (with `username`)                                  |
| `channel_updated`      | `{ id, channel_name }`                                       |
| `channel_deleted`      | `{ channelId }`                                              |
| `member_joined`        | `{ channelId, userId, username }`                            |
| `member_left`          | `{ channelId, userId }`                                      |
| `member_removed`       | `{ channelId, userId }`                                      |
| `member_role_updated`  | `{ channelId, userId, role }`                                |

---

## 📂 Project Structure

```
talkbox/
├── backend/
│   ├── drizzle/                 # generated SQL migrations
│   ├── src/
│   │   ├── db/                  # drizzle client + schema
│   │   ├── middleware/          # JWT auth middleware
│   │   ├── routes/              # auth, channels, messages
│   │   ├── schemas/             # zod request schemas
│   │   ├── socket/              # Socket.io setup + event handlers
│   │   └── index.ts             # HTTP + Socket.io bootstrap
│   └── drizzle.config.ts
├── frontend/
│   └── src/
│       ├── components/          # UI primitives + feature modals
│       ├── lib/                 # api client, socket, zustand stores
│       ├── routes/              # TanStack Router file-based routes
│       └── schemas/             # zod form schemas
└── shared/
    └── src/types.ts             # shared DTOs
```

---

## 🧭 Roadmap & Known Limitations

These are intentional trade-offs for an MVP — each one has a planned upgrade path:

- 🔒 **Tokens are stored in `localStorage`.** A short-lived access token + httpOnly refresh-token cookie pattern would be safer against XSS.
- 🧠 **Presence is tracked in an in-memory Map.** Horizontal scaling would require swapping in the Socket.io Redis adapter.
- 📜 **No message pagination yet.** Channel history is fetched in full on open — fine for the MVP, but cursor pagination is the obvious next step.
- ⏱ **Access tokens expire after 1 h with no refresh flow** — a refresh endpoint is on the list.
- 🧪 **Tests cover the critical paths (auth + channel access control), but not every endpoint yet** — Playwright for E2E is the planned next step.

---

## 📄 License

[MIT](./LICENSE) © Dogukan Kara
