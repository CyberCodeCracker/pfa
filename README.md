<div align="center">

# PFA — Internship Management Platform

**A role-based platform where teachers supervise and direct the workflow of student internships within a specific educational establishment.**

![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-16-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Conception (UML)](#conception-uml)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [API Documentation](#api-documentation)

---

## Overview

PFA is a full-stack internship management platform built as a single-page Angular
application backed by a Laravel REST API. It models a real supervision workflow:
an **establishment** hosts **internships (stages)**, a **teacher** supervises each
internship and its assigned **students**, and the whole lifecycle — from invitation
to document validation and milestone tracking — is driven through the app, with
real-time messaging and notifications keeping every participant in sync.

The project is organized around three delivery sprints:

| Sprint | Theme |
|--------|-------|
| **Sprint 1** | Authentication & Security |
| **Sprint 2** | Internship Management |
| **Sprint 3** | Dashboarding, Messaging & Notifications |

### Actors

- **Administrator** — manages establishments, users and global configuration.
- **Teacher** — creates internships, invites students, validates documents and milestones.
- **Student** — accepts invitations, uploads documents, tracks progress.

---

## Features

### 🔐 Authentication & Security (Sprint 1)

- **SPA authentication** via Laravel Sanctum — cookie-based sessions with CSRF protection.
- **Login throttling** — brute-force protection with rate limiting (HTTP 429 on too many attempts).
- **Role & establishment scoping** — every user is bound to a role and one or more establishments.
- **Invitation workflow** — teachers invite students by email with a temporary password; a
  **forced password change** is required on first acceptance via a tokenized invitation link.

### 🎓 Internship Management (Sprint 2)

- **Create & manage internships** — title, dates, establishment, semester and type.
- **Student assignment** — bulk-invite students to an internship; each receives an email invitation.
- **Document module** — upload files, flag a submission as the official report, server-side
  file-type validation, and a **teacher validation workflow** (`pending → validated`).
- **Milestones** — a sequential lifecycle (`create → validate → reopen`) where a step can only
  be validated once all previous steps are complete.
- **Automatic notifications** on document deposit and validation.

### 💬 Dashboarding, Messaging & Notifications (Sprint 3)

- **Real-time group chat** per internship over WebSockets (Laravel Reverb + Laravel Echo),
  with optimistic UI updates.
- **Private channel authorization** — Sanctum-authenticated broadcasting auth for secure channels.
- **Real-time notifications** — live unread badge, mark-as-read, and deep-link navigation
  to the relevant page.
- **Role-specific dashboards** and **internationalization** (i18n via ngx-translate).

---

## Tech Stack

### Backend

| Technology | Role |
|------------|------|
| **PHP 8.2 · Laravel 12** | Core framework & REST API |
| **Laravel Sanctum** | SPA cookie authentication & CSRF |
| **Laravel Reverb** | First-party WebSocket server (real-time broadcasting) |
| **Spatie Laravel Data** | Typed DTOs / API resources |
| **Spatie Query Builder** | Filtering, sorting & relation includes on API endpoints |
| **Dedoc Scramble** | Automatic OpenAPI / API documentation |
| **Pint · Pail · PHPUnit · Mockery · Faker** | Linting, log viewer & testing toolchain |

### Frontend

| Technology | Role |
|------------|------|
| **Angular 16 · TypeScript 5.1** | Single-page application |
| **Angular Material + CDK** | UI component library |
| **NgRx** (Store · Effects · Component Store) | State management |
| **Tailwind CSS 3** | Utility-first styling |
| **ngx-translate** | Internationalization (i18n) |
| **Laravel Echo + pusher-js** | Real-time WebSocket client |
| **RxJS** | Reactive streams |

### Infrastructure & DevOps

| Service | Role |
|---------|------|
| **nginx** | Reverse proxy — serves the Angular build and proxies the API |
| **php-fpm** | Runs the Laravel application |
| **reverb** | WebSocket server (`php artisan reverb:start`, port 8080) |
| **queue-worker** | Processes Redis queues (`broadcasts`, `default`) |
| **scheduler** | Runs Laravel's scheduled tasks |
| **MySQL 8** | Primary datastore |
| **Redis 7** | Cache, queues & broadcasting backend |
| **Mailpit** | Local SMTP capture & web mail UI (port 8025) |

---

## Architecture

```
                                ┌──────────────────────────┐
                                │   Angular 16 SPA (Echo)   │
                                └────────────┬─────────────┘
                                             │ HTTPS (REST, cookie auth)
                                             │ WSS (real-time)
                          ┌──────────────────┴──────────────────┐
                          │                nginx                 │
                          └───────┬───────────────────┬──────────┘
                                  │ /api/*            │ ws://:8080
                        ┌─────────┴────────┐   ┌──────┴───────┐
                        │  Laravel (PHP)   │   │   Reverb     │
                        │  Sanctum · API   │   │  WebSocket   │
                        └───┬────────┬─────┘   └──────┬───────┘
                            │        │                │
                     ┌──────┴──┐ ┌───┴────┐    ┌──────┴───────┐
                     │ MySQL 8 │ │ Redis 7│◄───┤ queue-worker │
                     └─────────┘ └────────┘    └──────────────┘
```

- The **Angular SPA** talks to the API under `/api/v1` using Sanctum's cookie-based auth
  (CSRF cookie + `XSRF-TOKEN`), and opens a **WebSocket** connection to Reverb for live updates.
- **Broadcasting** is queued through **Redis**; the dedicated **queue-worker** delivers events,
  and **Reverb** pushes them to subscribed private/presence channels.
- **Mailpit** captures all outgoing mail (invitations, notifications) during local development.

---

## Conception (UML)

> This section documents the analysis & design of the platform.
> Diagrams can be embedded either as images (`![alt](docs/diagrams/xxx.png)`) or,
> for sequence diagrams, pasted directly as GitHub-rendered ```mermaid``` code blocks.

### Use Case Diagram

<!-- 📌 Paste the use case diagram here (image or PlantUML/Mermaid) -->

_TODO: use case diagram_

### Class Diagram

<!-- 📌 Paste the class diagram here (image or PlantUML/Mermaid) -->

_TODO: class diagram_

### Sequence Diagrams

#### Sprint 1 — Authentication & Security

<!-- 📌 Paste the Sprint 1 sequence diagrams here (Login, Accept invitation) -->

_TODO: Sprint 1 sequence diagrams_

#### Sprint 2 — Internship Management

<!-- 📌 Paste the Sprint 2 sequence diagrams here (Create stage, Document, Milestone) -->

_TODO: Sprint 2 sequence diagrams_

#### Sprint 3 — Dashboarding, Messaging & Notifications

<!-- 📌 Paste the Sprint 3 sequence diagrams here (Realtime chat, Channel auth, Notification) -->

_TODO: Sprint 3 sequence diagrams_

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose, **or**
- PHP 8.2+, Composer, Node.js 18+ and MySQL 8 for a manual setup.

### Run with Docker (recommended)

```bash
# 1. Clone the repository
git clone <repository-url> pfa && cd pfa

# 2. Configure the backend environment
cp backend/.env.example backend/.env

# 3. Build the Angular app (served by nginx)
cd frontend && npm install && npm run build && cd ..

# 4. Start the full stack
docker compose up -d --build

# 5. Initialize the application (key + database)
docker compose exec php-fpm php artisan key:generate
docker compose exec php-fpm php artisan migrate --seed
```

| Service | URL |
|---------|-----|
| Application | http://localhost |
| Reverb (WebSocket) | ws://localhost:8080 |
| Mailpit (emails) | http://localhost:8025 |

### Run manually (without Docker)

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
composer dev          # serves API + queue + logs + reverb concurrently

# Frontend (in a second terminal)
cd frontend
npm install
npm start             # ng serve  →  http://localhost:4200
```

---

## Project Structure

```
pfa/
├── backend/        # Laravel 12 API (Sanctum, Reverb, Spatie Data/Query Builder)
├── frontend/       # Angular 16 SPA (NgRx, Material, Tailwind, Echo)
├── docker/         # nginx / php / mysql container configuration
├── diagrammes/     # UML source files (class & use case)
├── docker-compose.yml
└── SPRINT_*.md     # Per-sprint design & analysis documentation
```

---

## Testing

```bash
# Backend — PHPUnit
cd backend && php artisan test

# Frontend — Karma/Jasmine unit tests
cd frontend && npm test

# Frontend — Cypress end-to-end tests
cd frontend && npm run e2e
```

---

## API Documentation

Interactive API documentation is generated automatically by **Scramble** and is
available (in local development) at:

```
http://localhost/docs/api
```
