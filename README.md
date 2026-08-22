# 🚀 AltChat — Next-Generation Real-Time Messaging Platform

> **Live Application**: [https://engr-antor-chat-app.netlify.app](https://engr-antor-chat-app.netlify.app)  
> **API Documentation Specification**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)  
> 

AltChat is a high-performance, enterprise-grade real-time web application built with **Next.js 16 (App Router)**, **TypeScript**, **Zustand**, **Tailwind CSS v4**, and **Socket.IO**. Designed for high responsiveness, visual polish, and production reliability.

---

## 🛠️ Technology Stack & Rationale

* **Framework**: Next.js 16 (App Router) & React 19
* **Language**: TypeScript 5.x
* **State Management**: Zustand (with persistent auth store)
* **Real-time Engine**: Socket.IO Client 4.x (HTTP Polling → WebSocket auto-upgrade)
* **Form & Validation**: React Hook Form + Zod validation schemas
* **Styling**: Tailwind CSS v4 + Lucide React Icons
* **API Client**: Axios (with global auth interceptors)
* **Notifications**: Sonner toasts

---

## 📁 Repository Structure

```
├── public/
│   ├── logo.jpg               # AltChat brand logo
│   └── login-hero.png         # Login page hero vector illustration
├── src/
│   ├── app/
│   │   ├── page.tsx           # Product Showcase Landing Page
│   │   ├── login/page.tsx     # Authentication & Auto-Registration Screen
│   │   ├── chat/page.tsx      # Main Real-Time Messaging Workspace
│   │   ├── layout.tsx         # Root layout with Theme, Auth & Socket Providers
│   │   └── globals.css        # Global CSS variables & dark mode theme tokens
│   ├── components/
│   │   ├── chat/              # Messaging components (List, Input, Panels)
│   │   ├── landing/           # Landing page showcase sections
│   │   ├── providers/         # Auth, Socket, and Theme React context providers
│   │   └── ui/                # Reusable UI primitives (Avatar, Button, Input, Modal)
│   ├── lib/
│   │   ├── api.ts             # Axios instance & token interceptors
│   │   ├── socket.ts          # Socket.IO singleton manager & connection lifecycle
│   │   └── utils.ts           # Date formatting, avatar color hashing, temp ID generator
│   ├── services/
│   │   └── api.ts             # Strongly typed API client services
│   ├── store/
│   │   ├── authStore.ts       # Zustand auth store with localStorage persistence
│   │   └── chatStore.ts       # Zustand store for messages, conversations, & unreads
│   └── types/
│       └── index.ts           # TypeScript interfaces & API schemas
├── API_DOCUMENTATION.md       # Full Standalone API Specification (Markdown format)
├── netlify.toml               # Deployment configuration for Netlify
└── README.md                  # Comprehensive project documentation
```

---

## 🏃 Quick Start & Local Development

### Prerequisites
* **Node.js**: v18.x or v20.x
* **npm**: v9.x or later

### Installation & Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/engrAntor/chitchat-messenger.git
   cd chitchat-messenger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Build for production:
   ```bash
   npm run build
   npm run start
   ```

---

## 🌟 Key Application Features

* **Instant Auth & Auto-Provisioning**: Sign in requires only phone number and name. Unique phone numbers automatically provision new accounts.
* **1-on-1 & Group Messaging**: Seamless direct chats and group creation with participant management (add/remove members, promote admins, rename group).
* **Optimistic Updates & Message Reconciliation**: Messages display instantly with pending state (`⏳`) before server confirmation (`✓✓`), ensuring zero perceived latency.
* **Smart Auto-Scroll with History Lock**: Chat auto-scrolls to latest messages when at the bottom, but preserves scroll position when reading earlier history, complete with a floating unread message badge.
* **Multi-Transport Socket Resilience**: Socket.IO automatically manages room subscriptions (`join`, `join_room`, `join chat`) across active and background chats to ensure real-time delivery across network reconnections.
* **Dynamic Participant Resolution**: Unpopulated backend sender string IDs dynamically map to cached participant profiles to display full user names instead of generic fallback strings.

---

## 🏗️ Architecture & Engineering Design

### Why TypeScript?
TypeScript was adopted to enforce strict contract type-safety across complex real-time messaging payloads. In real-time Socket.IO and REST environments where message payloads contain nested user references, optional parameters, and optimistic status flags, TypeScript interface definitions guarantee zero `TypeError` crashes, enable auto-completion during development, and enforce robust validation at the API boundary.

### Why Next.js 16 (App Router) & React 19?
Next.js provides fast server-side rendering, file-based routing, and built-in asset optimization. The App Router enables clean isolation between marketing landing pages (`/`) and protected application routes (`/login`, `/chat`).

### State Architecture: Zustand
Real-time messaging applications demand high-frequency state updates (typing indicators, incoming message streams, unread badge increments). Madagascar. Zustand provides atomic state selectors that avoid unnecessary component re-renders while offering lightweight boilerplate and clean middleware persistence for auth sessions.

### Real-Time Protocol: Socket.IO Client
We implemented a dual transport strategy (`transports: ['polling', 'websocket']`). Starting with HTTP long-polling handshake before upgrading to WebSockets ensures 100% connection reliability across cloud hosting providers (e.g. Render/Netlify/Vercel) without premature connection drops.

---

## 🎨 Product Showcase Landing Page

The landing page features a complete interactive experience:
* **Interactive Live Sandbox**: An embedded live chat panel allowing visitors to test real-time messaging with an automated bot directly on the landing page.
* **Modern Design Tokens**: Soft cream/sand light theme, deep indigo/purple gradients, and glassmorphism UI components.
* **Performance Stats & Metrics**: Live performance metrics, responsive design, and smooth interactive micro-animations.

---

## 🚀 Deployment Instructions (Netlify & Vercel)

### Option 1: Deploying to Netlify (Recommended)
This repository includes a pre-configured `netlify.toml` file.

1. Log in to [Netlify](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
2. Select **GitHub** and authorize access to `engrAntor/chitchat-messenger`.
3. Set the following build options:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Click **Deploy site**. Netlify will automatically install `@netlify/plugin-nextjs` and publish the site to your custom domain (e.g. `https://engr-antor-chat-app.netlify.app`).

### Option 2: Deploying to Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2. Select `engrAntor/chitchat-messenger` from your GitHub repositories.
3. Framework Preset: **Next.js** (auto-detected).
4. Click **Deploy**.
