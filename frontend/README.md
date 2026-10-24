# Project Review Hub

A full-stack project submission and review platform where students
submit their projects and mentors review, approve, or reject them with
feedback.

## Features

### Student

-   Register and log in securely.
-   Submit a project with its name, repository URL, optional live demo
    URL, and description.
-   View personal submissions and their review status.
-   View mentor feedback.
-   Form validation and duplicate-submission protection.
-   Rate-limited API requests for relevant endpoints.

### Mentor
-   MENTOR_NAME="Jin"
-   MENTOR_EMAIL="jin@gmail.com"
-   MENTOR_PASSWORD="Jin1234@"
-   View submissions in a paginated dashboard.
-   Filter submissions by review status.
-   Approve or reject submissions.
-   Add feedback to submissions.
-   View submission statistics, including pending and approved
    submissions.

### Security

-   JWT-based authentication.
-   Role-based access control for students and mentors.
-   Password hashing.
-   Server-side validation.

## Technology Stack

### Frontend

-   Next.js (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Lucide React
-   Sonner

### Backend

-   Node.js
-   Express.js
-   TypeScript
-   PostgreSQL
-   Prisma ORM
-   JWT authentication
-   Zod validation
-   Express Rate Limit

## Project Structure

``` text
project-review-hub/
├── backend/
│   ├── prisma/
│   │   ├── schema/
│   │   └── migrations/
│   ├── src/
│   ├── prisma7.config.ts
│   └── package.json
└── frontend/
    ├── app/
    ├── components/
    ├── public/
    └── package.json
```

> The exact internal folders may differ depending on the current
> implementation.

## Prerequisites

Install the following before running the project:

-   Node.js (use a version supported by the installed dependencies)
-   npm
-   PostgreSQL database
-   Git

## Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/mdsheikhmohaimenulislam/project-review-hub.git
cd project-review-hub
```

### 2. Set up the backend

``` bash
cd backend
npm install
```

Create a `.env` file inside `backend/` and configure the required
variables:

``` env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
```

Use the actual connection string for your PostgreSQL database. Keep
`.env` out of version control and never publish real credentials.

Generate the Prisma Client and run the database migrations:

``` bash
npx prisma generate
npx prisma migrate dev --name init
```

If the project already has migrations, use the existing migrations
rather than creating a duplicate initial migration.


Start the backend using the development script defined in
`backend/package.json`:

``` bash
npm run dev
```

The backend is expected to run on `http://localhost:5000` when
configured with `PORT=5000`.

### 3. Set up the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

Create `frontend/.env.local` and set the backend URL variable used by
the frontend:

``` env
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
```

If the codebase uses a different environment variable name, use the
exact name referenced in the frontend source code.

Start the frontend:

``` bash
npm run dev
```

Open <http://localhost:3000>.

## API Overview

The following endpoints are part of the expected API design. Confirm the
route prefixes in the backend source if they differ.

  --------------------------------------------------------------------------------
  Method                  Endpoint                         Purpose
  ----------------------- -------------------------------- -----------------------
  `POST`                  `/api/auth/signup`               Register a user

  `POST`                  `/api/auth/login`                Log in

  `GET`                   `/api/auth/me`                   Get the authenticated
                                                           user

  `POST`                  `/api/submissions`               Create a student
                                                           submission

  `GET`                   `/api/submissions/me`            Get the current
                                                           student's submission(s)

  `GET`                   `/api/reviews?page=1&limit=10`   Get paginated
                                                           submissions for mentor
                                                           review

  `PATCH`                 `/api/reviews/:id`               Update a review or
                                                           submission status

  `GET`                   `/api/stats`                     Get dashboard
                                                           statistics
  --------------------------------------------------------------------------------

Protected endpoints require valid authentication. Mentor-only endpoints
require the `MENTOR` role.

## User Roles and Submission Statuses

**Roles** - `STUDENT` - `MENTOR`

**Submission statuses** - `PENDING` - `APPROVED` - `REJECTED`

New submissions normally start with `PENDING` status.

## Validation and Duplicate Prevention

The backend should validate submitted project data and URLs before
saving it. Duplicate prevention should be enforced on the
server/database side, not only in the UI. Rate limiting should be
configured for relevant endpoints.

## Production Build

Run these commands from each project directory, using the scripts
defined in its `package.json`:

``` bash
# Backend
cd backend
npm run build

# Frontend (in a separate terminal, from the repository root)
cd frontend
npm run build
```

## Environment Variables

Do not commit `.env` or `.env.local` files. Add real environment values
through your deployment provider's environment-variable settings.

  ---------------------------------------------------------------------------
  Variable                    Used by                 Description
  --------------------------- ----------------------- -----------------------
  `DATABASE_URL`              Backend                 PostgreSQL connection
                                                      string

  `JWT_SECRET`                Backend                 Secret used to sign
                                                      JWTs

  `PORT`                      Backend                 Backend server port (if
                                                      supported)

  `NEXT_PUBLIC_BACKEND_URL`   Frontend                Backend base URL
                                                      (confirm this name in
                                                      the source)
  ---------------------------------------------------------------------------

## Notes

-   The exact npm scripts and environment variable names depend on the
    current `package.json` and source code. Use the names defined by
    your project.
-   Never commit database credentials, JWT secrets, access tokens, or
    other sensitive configuration.
-   If seeded mentor credentials are configured, obtain them from the
    seed script or project documentation rather than publishing private
    credentials in this file.

## License

Add a license here if you intend to distribute this project as open
source.
