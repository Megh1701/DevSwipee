<div align="center">
  <h1>🚀 DevSwipe System Architecture</h1>
  <p><em>A deep-dive into the MERN stack architecture powering the DevSwipe platform.</em></p>
</div>

---

## 🏗️ 1. Architecture Summary

Based on a comprehensive analysis of the actual codebase, DevSwipe is a monolithic web application built on the **MERN stack** with real-time bidirectional communication.

### 💻 Actual Tech Stack
*   🎨 **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Axios for HTTP.
*   ⚙️ **Backend**: Node.js, Express.js.
*   🗄️ **Database**: MongoDB with Mongoose ORM.
*   ⚡ **Real-time**: Socket.IO (In-memory adapter).
*   🔒 **Authentication**: Custom JWT-based stateless authentication.
*   🔌 **External APIs**: Gemini API (ATS project scoring), Cloudinary (image uploads).


## 🧩 2. Component Breakdown

### 🔐 A. Authentication (JWT-based)
*   **Implementation**: Stateless auth. The backend generates two JWTs (`accessToken` and `refreshToken`) stored securely as `HttpOnly` cookies.
*   **Flow**: Frontend `axios` interceptors catch `401 Unauthorized` responses and automatically hit `/auth/refresh`. Failed requests are queued, tokens are refreshed, and original requests are retried invisibly to the user.

### 💝 B. Swipe System (`swipeController.js`)
*   **Implementation**: Users swipe on projects (Left = `ignore`, Right = `interested`).
*   **Logic**: Before a swipe is recorded, the backend validates the user's daily limit (10 swipes/day) directly against the MongoDB `User` document. Right swipes create a `SwipeModel` document and emit a `"swipe"` notification.

### 🤝 C. Match Engine (`matchController.js`)
*   **Implementation**: Mutual acceptance based.
*   **Logic**: When a user accepts an incoming swipe, the backend sets that swipe status to `"accepted"`. It queries the DB for the *opposite* swipe. If both users accepted, a `MatchModel` document is created, and `"match"` notifications are emitted via socket.

### 💬 D. Real-time Chat & Collaboration (`socket.js`)
*   **Implementation**: Socket.IO for chat, notifications, and task management.
*   **Rooms**: 
    *   `joinUserRoom(userId)`: User-specific real-time notifications.
    *   `joinRoom(matchId)`: Isolated chat messages for match channels.
    *   `join-session(sessionId)`: Collaborative Kanban task boards.
*   **Chat Flow**: Messages save to MongoDB (`ChatModel`), populate with user data, and broadcast to the `matchId` socket room.

### 🔔 E. Notification System (`notificationController.js`)
*   **Implementation**: Persistent + Real-time.
*   **Logic**: The backend creates a `NotificationModel` document and attempts to emit it via `io.to(userId).emit("newNotification")`. If offline, the emit drops, but the notification remains unread in MongoDB to be fetched on the next load.

---

## 📈 3. Flow Diagrams

### 🌐 (A) High-level Architecture Diagram

```mermaid
graph TD
    subgraph Frontend Client
        React[React / Vite UI]
        Axios[Axios Interceptors]
        SocketClient[Socket.IO Client]
    end

    subgraph Backend Server Node.js
        Express[Express REST API]
        Auth[Auth Middleware]
        SocketServer[Socket.IO Server\nIn-Memory Adapter]
        
        Controllers[Controllers\nSwipe, Match, Chat, ATS]
        Gemini[Gemini Service]
    end

    subgraph Database Layer
        MongoDB[(MongoDB)]
        Models[Mongoose Models\nUser, Swipe, Match, Session]
    end

    %% Flow connections
    React -->|HTTP Requests| Axios
    Axios -->|JWT in HttpOnly Cookies| Express
    Express --> Auth
    Auth --> Controllers
    Controllers -->|CRUD Operations| Models
    Models --> MongoDB
    Controllers <-->|HTTP Requests| Gemini
    
    React -->|WebSocket| SocketClient
    SocketClient <-->|Real-time Events| SocketServer
    Controllers -.->|Emit Notifications| SocketServer
```

### 🔄 (B) Swipe → Match → Chat Flow

```mermaid
stateDiagram-v2
    [*] --> BrowseProjects
    
    BrowseProjects --> SwipeRight : User A swipes right
    
    state SwipeRight {
        direction LR
        BackendValidate --> CheckLimit: DB Query
        CheckLimit --> SaveSwipe: Limit OK
        SaveSwipe --> NotifyOwner: Emit 'swipe'
    }
    
    SwipeRight --> OwnerReviews : User B opens Requests
    OwnerReviews --> SwipeAccepted : User B accepts swipe
    
    state SwipeAccepted {
        direction LR
        UpdateSwipe --> FindOpposite: Set 'accepted'
        FindOpposite --> MatchFound: Query opposite swipe
        MatchFound --> CreateMatch: Create MatchModel
        CreateMatch --> EmitMatches: Notify users via Socket
    }
    
    SwipeAccepted --> ChatRoom : Navigate to Messages
    
    state ChatRoom {
        direction LR
        UserTypes --> SocketTyping: emit('typing')
        UserSends --> SaveMsg: API/Socket emit
        SaveMsg --> DBPersist: Save to ChatModel
        DBPersist --> SocketBroadcast: emit('receiveMessage')
    }
```

### 📡 (C) API Authentication Flow

```mermaid
sequenceDiagram
    participant UI as React Frontend
    participant API as Express Router
    participant Interceptor as Axios Interceptor
    participant DB as MongoDB

    UI->>Interceptor: GET /api/ats/my-projects
    Interceptor->>API: HTTP GET (with Access Cookie)
    
    alt Token Expired (401)
        API-->>Interceptor: 401 Unauthorized
        Interceptor->>API: POST /auth/refresh (with Refresh Cookie)
        API->>DB: Validate Refresh Token
        DB-->>API: Valid
        API-->>Interceptor: Set New Access Cookie
        Interceptor->>API: Retry GET /api/ats/my-projects
    end
    
    API->>DB: Fetch Project Scores
    DB-->>API: Data
    API-->>UI: 200 OK + JSON
```

### 👥 (D) End-to-End User Interaction Flow

```mermaid
sequenceDiagram
    actor UserA
    participant SocketA as User A Socket
    participant API as Backend API
    participant DB as MongoDB
    participant SocketB as User B Socket
    actor UserB

    %% Real-time connection
    UserA->>SocketA: Connect
    SocketA->>API: socket.join(userId_A)
    UserB->>SocketB: Connect
    SocketB->>API: socket.join(userId_B)

    %% Swipe Flow
    UserA->>API: POST /api/swipe (interested)
    API->>DB: Create SwipeModel & NotificationModel
    API-->>SocketB: emit("newNotification", swipe)
    SocketB-->>UserB: Show Notification Badge

    %% Match Flow
    UserB->>API: POST /api/matches/accept
    API->>DB: Update Swipe & Create MatchModel
    API-->>SocketA: emit("newNotification", match)
    SocketA-->>UserA: Show Notification Badge

    %% Chat Flow
    UserA->>SocketA: emit("joinRoom", matchId)
    UserB->>SocketB: emit("joinRoom", matchId)
    
    UserA->>SocketA: emit("sendMessage", data)
    SocketA->>API: Handle Event
    API->>DB: Save ChatModel & NotificationModel
    API-->>SocketB: emit("receiveMessage", data)
    SocketB-->>UserB: Display Message in UI
```
