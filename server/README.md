# Simple HTTP Server

This project is a simple HTTP server implemented in TypeScript, designed to serve as a foundation for a WebSocket game server.

## Project Structure

```
server
├── src
│   ├── server.ts          # Entry point of the server application
│   ├── routes
│   │   └── index.ts      # Defines the routes for the server
│   └── types
│       └── index.ts      # Custom types and interfaces
├── package.json           # npm configuration file
├── tsconfig.json          # TypeScript configuration file
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd server
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Running the Server

To start the server, run the following command:

```
npm start
```

The server will listen on the specified port (default is 3000) and respond with a basic message to incoming requests.

### Development

For development purposes, you can use the following command to compile TypeScript files:

```
npm run build
```

### License

This project is licensed under the MIT License.