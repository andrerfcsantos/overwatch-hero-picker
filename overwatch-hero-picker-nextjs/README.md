# Overwatch 2 Hero Picker - Next.js Version

A modern rewrite of the Overwatch 2 Random Hero Picker using Next.js, TypeScript, and Tailwind CSS.

## Features

- **Random Hero Selection**: Get random hero suggestions based on your preferences
- **Hero Filtering**: Select/deselect heroes by role (Tank, Damage, Support)
- **Team Generator**: Generate random team compositions for squad play
- **Hero Perks**: Random perk suggestions for each hero
- **Responsive Design**: Works on desktop and mobile devices
- **Client-Side Only**: Runs entirely in the browser with no server dependency

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Hooks** - Modern React state management
- **ESLint & Prettier** - Code linting and formatting

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd overwatch-hero-picker-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── about/          # About page
│   ├── squad/          # Team generator page
│   └── globals.css     # Global styles
├── components/         # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and data
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Key Features

### Hero Management
- Select/unselect individual heroes by clicking their cards
- Bulk select/unselect heroes by role
- "Just this role" functionality to select only heroes from a specific role
- Persistent selection using localStorage

### Random Generation
- Single hero picker with optional hero perks
- Team generator with 1-2-2 composition (1 Tank, 2 Damage, 2 Support)
- Classic random squad generator for any composition
- Copy team composition to clipboard

### Responsive Design
- Mobile-friendly navigation with hamburger menu
- Responsive hero card layout
- Optimized for both desktop and mobile viewing

## Migration from Vue.js

This project is a complete rewrite of the original Vue.js application, featuring:

- Modern React architecture with hooks instead of Vuex
- TypeScript for better type safety
- Tailwind CSS replacing Bootstrap
- Next.js App Router for better performance
- Client-side rendering with static export capability

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is a fan-site for Overwatch and is not affiliated with Blizzard Entertainment.

Overwatch™ ©2016 Blizzard Entertainment, Inc. All rights reserved. Overwatch is a trademark or registered trademark of Blizzard Entertainment, Inc. in the U.S. and/or other countries.