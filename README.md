Dynamic Chat Room Application
Overview
This repository contains the code for a dynamic chat room application that allows multiple users to chat concurrently. The application utilizes a combination of C++ for the backend and React with Node.js for the frontend.

System Architecture
Server
The application is hosted on a Google Cloud EC2 instance and uses a multi-thread WebSocket server to handle incoming TCP connections. These connections are upgraded to WebSocket connections, allowing for real-time communication between users.

Thread Management
A main thread sets up the server, listening for incoming TCP connections. Each new connection spawns a new thread that manages the WebSocket session, ensuring that multiple users can send and receive messages simultaneously without blocking new connections.

Synchronization
Thread safety is managed using a mutex that protects access to the 'client' vector, which tracks all active WebSocket connections. This ensures that concurrent modifications to the vector are handled safely.

Features
Real-time messaging among multiple users.
Dynamic user interface that updates without manual refreshing.
Efficient handling of multiple users through multi-threading.
