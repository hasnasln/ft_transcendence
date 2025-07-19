import { Server } from "socket.io";

export function emitError(errorMessage: string, socketId: string, io: Server) {
    io.to(socketId).emit("gameServerError", errorMessage);
}