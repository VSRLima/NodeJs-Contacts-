# Node JS Contacts

Full-stack contact manager built with NestJS on Node.js 22, Vue 3, TypeORM and MariaDB. Everything required by the exercise lives inside this `html/` folder.

## Features

- JWT authentication with access and refresh tokens, with refresh-token rotation and a 2 hour refresh window.
- Role-based access: admins can manage all contacts and users; basic users can only manage their own contacts.
- Contacts CRUD with shared create/edit form, details page, and delete confirmation modal.
- Persistent light/dark mode and `en-US` / `pt-PT` interface translations.
- TypeORM MariaDB persistence, JSON structured logs, `x-request-id`, CORS origin whitelist and health checks.
- ESLint, Prettier, Husky, Commitlint, Vitest unit/e2e tests, Docker and GitHub Actions.

## Local Setup

```bash
cp .env.example .env
npm install
npm run dev:stack
```

`npm run dev:stack` starts the MariaDB container first and then runs the API and Vue dev server. If MariaDB is already running, `npm run dev` is enough.

If you previously ran the full Docker app, stop it before local dev so port `3000` is free:

```bash
docker compose down
npm run dev:stack
```

If you want to keep whatever is using port `3000`, run the dev API on `3001` instead:

```bash
npm run dev:alt
```

Default seeded admin:

- User: `admin`
- Password: `admin123`

## Scripts

```bash
npm run db:up
npm run dev
npm run dev:alt
npm run docker:app
npm run lint
npm run format:check
npm test
npm run build
npm start
```

## Docker

```bash
cp .env.example .env
npm run docker:app
```

The app listens on `http://localhost:3000`. Health checks are available at `/health/live` and `/health/ready`.

For local development, prefer `npm run dev:stack`. It starts only the MariaDB service in Docker and keeps port `3000` available for the local API.
