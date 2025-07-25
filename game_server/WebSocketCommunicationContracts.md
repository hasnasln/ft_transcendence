# WebSocket Communication Contracts

### Keep alive mechanism
We use socket.io's ping-pong scheme.

### Scheme parsing
We use only JSON.

### Error handling
Game server notifies about internal errors using `game_error` channel.
Socket.io's connection errors has special channel named `connection_error`.

### Network bandwidth
~5 MB/hour on an active play.

## Communication of standard game

Client sends HTTPS request (with JWT) to the server.
If server accepts connection, connection upgrade to WSS.

### Phase 1, negotation of game configuration
Client initiates communication by sending `create` message. This message tells the server that
the client wishes to start a new game and specifies its type. All possible examples:

| Mode        | Way | Channel | Message                                            |
|-------------|-----|---------|----------------------------------------------------|
| remote      | C->S    | create | `{"game_mode": "remote"}`                     |
| tournament  | C->S    | create | `{"game_mode": "tournament"}`                 |
| local       | C->S    | create | `{"game_mode": "local"}`                      |
| AI          | C->S    | create | `{"game_mode": "vsAI", "level": "medium"}`    |

Now, server prepares for the game specified by client. 

### Phase 2, wait for opponent
In Remote and Tournament modes, clients have to wait for `match-ready` message.

| Mode        | Way  | Channel     | Message                                      |
|-------------|------|-------------|----------------------------------------------|
| remote      | S->C | match-ready | `{"rival": "coktehlikeliyim41"...}`          |
| tournament  | S->C | match-ready | `{"rival": "coktehlikeliyim41"...}`          |
| local       | -    | -           | -                                            |
| AI          | -    | -           | -                                            |

### Phase 3, approvement of play
To actually play, client must explicitly tell it is ready to play.

| Mode | Way  | Channel | Message |
|------|------|---------|---------|
| all  | C->S | ready   | `{}`    |

### Phase 4, game start
Server sends first packet of the game.

| Mode | Way  | Channel       | Message |
|------|------|---------------|---------|
| all  | S->C | gameConstants | `{...}` |
| all  | S->C | updateState   | `{...}` |
| all  | S->C | gameState     | `{...}` |
| all  | S->C | paddleUpdate  | `{...}` |
| all  | S->C | bu            | `{...}` |

**note**: "bu" means "ball update".

When all of these packets recieved by client at once, a game will start at client side.

## Unexpected communication cases

### Phase 3, timeout of approvement
When rival client sent ready packet, the client must send ready packet in 20 seconds. If
it didn't, rival and the client will recieve `match-cancelled` message and their ready
messages will dropped.

| Mode | Way  | Channel       | Message |
|------|------|---------------|---------|
| remote  | S->C | match-cancelled | `{...}` |
| tournament  | S->C | match-cancelled | `{...}` |
