# Quest Tracker

A fantasy-themed quest management system built with Next.js, React, and TypeScript. This application allows adventurers to join quests and guild commanders to create and manage quests.

## Features

### For Adventurers
- Browse available quests on the quest board
- Join and leave quests
- Track quest progress and status
- View quest details including description and party size

### For Guild Commanders
- Create and manage quests
- Track adventurer participation
- Update quest status (start journey, mark as completed, mark as failed)
- Delete quests when necessary

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: React Context API
- **Form Handling**: React Hook Form, Zod validation
- **Authentication**: JWT-based auth with HttpOnly cookies

## Installation and Setup

### Prerequisites
- Node.js (v18.17 or higher)
- npm, yarn, or pnpm

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quest_tracker.git
   cd quest_tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8090
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open in browser**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Application Structure

- `src/app`: Next.js App Router pages
- `src/components`: Reusable React components
- `src/contexts`: React Context providers
- `src/services`: API service layer
- `src/types`: TypeScript type definitions
- `src/lib`: Utility functions

## Authentication System

The application uses a role-based authentication system with two user types:
- **Adventurers**: Can join and leave quests
- **Guild Commanders**: Can create, manage, and update quests

Authentication is managed through JWT tokens stored in HttpOnly cookies for security.

## Quest Management Flow

1. **Guild Commander** creates a new quest
2. **Adventurers** can join the quest (up to 4 per quest)
3. **Guild Commander** can initiate the journey when ready
4. **Guild Commander** can mark the quest as completed or failed
5. Failed quests can be rejoined and restarted

## API Endpoints

The application communicates with a backend API (expected at http://localhost:8090 by default) with these main service groups:

- **Authentication**: Login, registration, token refresh
- **Quest Operations**: Create, edit, delete quests
- **Quest Viewing**: View quest details, browse quests
- **Crew Switchboard**: Join and leave quests
- **Journey Ledger**: Update quest status

## UI Components

The app uses [shadcn/ui](https://ui.shadcn.com/) components, which are built on top of Radix UI primitives. These components are fully accessible and customizable through Tailwind CSS.

## Deployment

This is a Next.js application and can be deployed on Vercel or any platform that supports Next.js:

```bash
npm run build
npm run start
```

For production deployment, follow the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.