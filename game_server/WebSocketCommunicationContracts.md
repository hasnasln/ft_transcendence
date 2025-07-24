# WebSocket Communication Contracts

Client sends HTTPS request (with JWT) to the server.
If server accepts connection, connection upgrade to WSS.


## PHASE 1
Client initiates communication by sending `create` message. This message explains
client wishes to play a new game and what the kind of game is this. All possible examples:

| Mode        | Way | Channel | Message                                            |
|-------------|-----|---------|----------------------------------------------------|
| remote      | C->S    | create | `{"game_mode": "remote"}`                     |
| tournament  | C->S    | create | `{"game_mode": "tournament"}`                 |
| local       | C->S    | create | `{"game_mode": "local"}`                      |
| AI        | C->S    | create | `{"game_mode": "vsAI", "level": "medium"}`    |

Now, server prepares for the game specified by client. 

## PHASE 2
In Remote and Tournament modes, clients have to wait `match-ready` message.

| Mode        | Way  | Channel     | Message                                      |
|-------------|------|-------------|----------------------------------------------|
| remote      | S->C | match-ready | `{"rival": "coktehlikeliyim41"...}`          |
| tournament  | S->C | match-ready | `{"rival": "coktehlikeliyim41"...}`          |
| local       | —    | —           | —                                            |
| AI        | —    | —           | —                                            |

# PHASE 3
To actual play, client must explicitly tell it is ready to play.

| Mode | Way  | Channel | Message |
|------|------|---------|---------|
| all  | C->S | ready   | `{}`    |

# PHASE 4
On this phase server starts the game on its side. Tells client to make ready the UI.

| Mode | Way  | Channel        | Message |
|------|------|----------------|---------|
| all  | S->C | gameConstants  | `{}`    |

# PHASE 5
Server sends first packet of the game. This is done after a few milliseconds than phase 4.
With first packet, the game starts on the client side.

| Mode | Way  | Channel      | Message |
|------|------|--------------|---------|
| all  | S->C | updateState  | `{...}` |
| all  | S->C | gameState    | `{...}` |
| all  | S->C | paddleUpdate | `{...}` |
| all  | S->C | bu           | `{...}` |

**note**: "bu" means "ball update".