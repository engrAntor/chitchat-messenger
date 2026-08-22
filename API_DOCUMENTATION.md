# 📘 AltChat API Documentation & Integration Guide

> **Live Application**: [https://engr-antor-chat-app.netlify.app](https://engr-antor-chat-app.netlify.app)  
> **Backend Base URL**: `https://frontend-task-chatapp.onrender.com`  
> **Protocols Supported**: HTTP/1.1 (REST API) & WebSockets / WSS (Socket.IO 4.x)  
> **Content-Type**: `application/json`  
> **Interactive Swagger Documentation**: [https://frontend-task-chatapp.onrender.com/docs/](https://frontend-task-chatapp.onrender.com/docs/)

---

## 📑 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Authentication & Security](#2-authentication--security)
3. [REST API Endpoints](#3-rest-api-endpoints)
   - [Authentication](#authentication)
   - [User Discovery](#user-discovery)
   - [Conversations Management](#conversations-management)
   - [Messaging History](#messaging-history)
   - [Group Administration](#group-administration)
4. [Real-Time WebSocket (Socket.IO) Protocol](#4-real-time-websocket-socketio-protocol)
   - [Connection Handshake](#connection-handshake)
   - [Client Outbound Events](#client-outbound-events)
   - [Server Inbound Events](#server-inbound-events)
5. [Error Handling & HTTP Status Matrix](#5-error-handling--http-status-matrix)
6. [Deployment & Environment Setup (Netlify & Vercel)](#6-deployment--environment-setup-netlify--vercel)

---

## 1. Overview & Architecture

AltChat provides a scalable real-time messaging architecture combining stateless RESTful HTTP services for user authentication, message persistence, and conversation creation with full-duplex Socket.IO WebSocket channels for instant bi-directional chat streaming.

---

## 2. Authentication & Security

All API endpoints (except public auth endpoints) require **JSON Web Token (JWT)** authentication.

* **Token Issuance**: Issuance occurs on `POST /auth/login`. Phone numbers are uniquely indexed; new accounts are provisioned automatically.
* **REST Header Format**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
* **Socket.IO Transport Auth**:
  ```typescript
  import { io } from 'socket.io-client';

  const socket = io('https://frontend-task-chatapp.onrender.com', {
    auth: { token: 'YOUR_JWT_TOKEN' },
    query: { token: 'YOUR_JWT_TOKEN' },
    transports: ['polling', 'websocket'],
  });
  ```

---

## 3. REST API Endpoints

### Authentication

#### `POST /auth/login`
Authenticates an existing user or provisions a new user profile based on phone number.

* **Request Body**:
  ```json
  {
    "phone": "+15551234567",
    "name": "Antor Chandra Das"
  }
  ```
* **Response** `(200 OK / 201 Created)`:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6a889e80e5d6aac9752436a7",
      "name": "Antor Chandra Das",
      "phone": "+15551234567",
      "createdAt": "2026-08-22T05:00:00.000Z"
    }
  }
  ```

#### `GET /auth/me`
Retrieves authenticated session profile.

* **Headers**: `Authorization: Bearer <token>`
* **Response** `(200 OK)`:
  ```json
  {
    "_id": "6a889e80e5d6aac9752436a7",
    "name": "Antor Chandra Das",
    "phone": "+15551234567",
    "createdAt": "2026-08-22T05:00:00.000Z"
  }
  ```

---

### User Discovery

#### `GET /users/search?q={query}`
Searches platform users by name or phone string.

* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**: `q` *(string, required)*
* **Response** `(200 OK)`:
  ```json
  [
    {
      "_id": "6b998f91f6e7bbd0863547b8",
      "name": "Sarah Connor",
      "phone": "+15559876543"
    }
  ]
  ```

---

### Conversations Management

#### `GET /conversations`
Lists all active direct and group conversations for the user.

* **Headers**: `Authorization: Bearer <token>`
* **Response** `(200 OK)`:
  ```json
  [
    {
      "_id": "6c001a23b4e5f6789012345a",
      "type": "direct",
      "participants": [
        {
          "_id": "6a889e80e5d6aac9752436a7",
          "name": "Antor Chandra Das",
          "phone": "+15551234567"
        },
        {
          "_id": "6b998f91f6e7bbd0863547b8",
          "name": "Sarah Connor",
          "phone": "+15559876543"
        }
      ],
      "lastMessage": {
        "_id": "6d112b34c5f6a789012345b6",
        "conversationId": "6c001a23b4e5f6789012345a",
        "sender": {
          "_id": "6b998f91f6e7bbd0863547b8",
          "name": "Sarah Connor",
          "phone": "+15559876543"
        },
        "text": "Hello Antor! How is the real-time setup going?",
        "createdAt": "2026-08-22T05:30:00.000Z"
      },
      "updatedAt": "2026-08-22T05:30:00.000Z",
      "createdAt": "2026-08-22T05:00:00.000Z"
    }
  ]
  ```

#### `POST /conversations`
Creates or resolves a 1-on-1 direct conversation.

* **Request Body**:
  ```json
  {
    "userId": "6b998f91f6e7bbd0863547b8"
  }
  ```

#### `POST /conversations/group`
Creates a multi-user group chat room.

* **Request Body**:
  ```json
  {
    "name": "Core Engineering",
    "participantIds": [
      "6b998f91f6e7bbd0863547b8",
      "6c002b44d5e6f789012345c9"
    ]
  }
  ```

---

### Messaging History

#### `GET /conversations/:id/messages`
Retrieves chat history using cursor pagination.

* **Query Parameters**:
  * `limit` *(number, optional)*: Default `30`.
  * `before` *(string, optional)*: Cursor message ID.
* **Response** `(200 OK)`:
  ```json
  {
    "messages": [
      {
        "_id": "6d112b34c5f6a789012345b6",
        "conversationId": "6c001a23b4e5f6789012345a",
        "sender": {
          "_id": "6b998f91f6e7bbd0863547b8",
          "name": "Sarah Connor",
          "phone": "+15559876543"
        },
        "text": "Hello Antor! How is the real-time setup going?",
        "createdAt": "2026-08-22T05:30:00.000Z"
      }
    ],
    "hasMore": false
  }
  ```

#### `POST /messages`
Dispatches a new message payload to a conversation.

* **Request Body**:
  ```json
  {
    "conversationId": "6c001a23b4e5f6789012345a",
    "text": "It's running flawlessly!"
  }
  ```

---

### Group Administration

* `POST /conversations/:groupId/participants` — Add users to group.
* `DELETE /conversations/:groupId/participants/:userId` — Remove user or leave group.
* `POST /conversations/:groupId/admins` — Grant admin rights.
* `PATCH /conversations/:groupId` — Update group title.

---

## 4. Real-Time WebSocket (Socket.IO) Protocol

### Connection Handshake
Sockets initiate via HTTP long-polling handshake (`polling`) before automatically upgrading to persistent `websocket` connection to ensure maximum firewall and proxy compatibility.

### Client Outbound Events

| Event | Target | Purpose |
| :--- | :--- | :--- |
| `setup` | User Object | Registers user socket session |
| `join` / `join_room` / `join chat` | Room / Convo ID | Joins specific room stream |
| `newMessage` / `send message` | Message Payload | Broadcasts message to room members |

### Server Inbound Events

| Event | Payload | Purpose |
| :--- | :--- | :--- |
| `newMessage` / `message:new` | `{ message: Message }` | Live incoming message broadcast |
| `conversation:updated` | `{ conversation: Conversation }` | Live group metadata update |

---

## 5. Error Handling & HTTP Status Matrix

| Status Code | Description | Corrective Action |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | None |
| `201 Created` | Resource created | None |
| `400 Bad Request` | Invalid parameters | Verify JSON payload structure |
| `401 Unauthorized` | Invalid/expired JWT | Re-authenticate via `/auth/login` |
| `404 Not Found` | Entity not found | Check object ID |
| `500 Server Error` | Backend issue | Retry request after short exponential delay |

---

## 6. Deployment & Environment Setup (Netlify & Vercel)

### Netlify Deployment
1. Import repository into Netlify.
2. Build Command: `npm run build`
3. Publish Directory: `.next`
4. Netlify Plugin `@netlify/plugin-nextjs` is configured automatically via `netlify.toml`.

### Vercel Deployment
1. Import repository into Vercel.
2. Framework Preset: `Next.js`
3. Build Command: `next build`
