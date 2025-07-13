# TaskMaster

A comprehensive project management application built with React, TypeScript, and Supabase.

## Features

- **Projects & Workstreams**: Organize work into projects with visual workstream boards
- **Task Management**: Create, edit, and track tasks with priorities, due dates, and tags
- **Gantt Timeline**: Visual project timeline with smart auto-scaling
- **Dark Mode**: Full dark mode support with theme persistence
- **Icon Themes**: Multiple icon themes including modern, retro, minimal, and playful styles
- **Real-time Updates**: Live data synchronization with Supabase
- **Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd taskmaster
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query
- **Icons**: Lucide React with multiple theme options
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (theme, icons)
├── types/              # TypeScript type definitions
├── lib/                # Utilities and configurations
└── styles/             # Global styles and themes
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details