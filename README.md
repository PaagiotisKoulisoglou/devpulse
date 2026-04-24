# DevPulse

DevPulse is an AI-powered developer dashboard that connects to your GitHub account, syncs your activity, and gives you personalized coaching insights, goals, and chat guidance.

## Features

- GitHub OAuth login via Supabase Auth
- One-click GitHub sync for repos and recent commits
- Developer activity dashboard with:
  - commit streaks
  - language insights
  - activity heatmap
  - recent commits
  - repository overview
- AI coaching summary generated from your real GitHub activity
- AI-generated goal suggestions plus saved goals management
- AI chat coach with session history and auto-expiry
- Light/dark theme toggle
- PWA support (installable app in production)

## Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn-style UI patterns
- **Auth & Database:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI:** Groq SDK (`llama-3.3-70b-versatile`)
- **Charts/visuals:** Recharts
- **PWA:** `next-pwa`

## Project Structure

```text
app/
  api/
    chat/         # chat generation + save/clear
    goals/        # goal generation + save/delete
    summary/      # AI coaching summary
    sync/         # GitHub data sync
  auth/callback/  # OAuth callback
  dashboard/      # main authenticated dashboard
  login/          # sign-in screen

components/
  dashboard/      # dashboard cards/widgets
  ThemeProvider.tsx
  ThemeToggle.tsx
  SyncButton.tsx
  InstallPrompt.tsx

lib/
  supabase/       # browser/server Supabase clients
  github.ts       # GitHub API helpers
  groq.ts         # Groq client + model
  stats.ts        # local computed stats
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

## Supabase Setup (Required)

You need these tables (minimum fields inferred from the app code):

### `users`
- `id` (uuid, primary key, matches auth user id)
- `email` (text)
- `github_username` (text)
- `github_token` (text)
- `avatar_url` (text)

### `repos`
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> users.id)
- `github_id` (bigint/int, unique)
- `name` (text)
- `language` (text)
- `stars` (int)
- `last_pushed_at` (timestamp)

### `commits`
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> users.id)
- `repo_id` (uuid, fk -> repos.id)
- `message` (text)
- `committed_at` (timestamp)

### `goals`
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> users.id)
- `title` (text)
- `target_date` (date)
- `completed` (boolean, default false)

### `chat_messages`
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> users.id)
- `role` (text: `user` or `assistant`)
- `content` (text)
- `session_id` (text/uuid)
- `expires_at` (timestamp)
- `created_at` (timestamp default now)

Also enable GitHub as an OAuth provider in Supabase Auth and configure redirect URL:

- `http://localhost:3000/auth/callback` (local)
- your production callback URL

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - start dev server
- `npm run build` - build production app
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Core API Routes

- `POST /api/sync`  
  Sync GitHub repos and recent commits into Supabase.

- `POST /api/summary`  
  Stream AI-written coaching summary from your activity.

- `POST /api/goals`  
  Generate personalized goals with AI.

- `POST /api/goals/save`  
  Save a goal (with validation for duplicates and max active goals).

- `POST /api/goals/delete`  
  Delete a saved goal.

- `POST /api/chat`  
  Stream AI chat responses with user context.

- `POST /api/chat/save`  
  Persist chat messages and update session expiry.

- `POST /api/chat/clear`  
  Clear chat session messages.

## Notes

- PWA is enabled in production and disabled in development.
- Chat sessions currently auto-expire after 30 minutes of inactivity.
- The dashboard route requires an authenticated Supabase user.

## Deployment

Deploy to any Next.js-compatible platform (for example, Vercel).  
Make sure production environment variables and Supabase OAuth redirect URLs are configured.

## License

Private project.
