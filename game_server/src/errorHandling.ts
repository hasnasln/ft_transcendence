import { ConnectionHandler } from "./connection";

export function emitError(errorMessage: string, socketId: string) {
    ConnectionHandler.getInstance().getServer().to(socketId).emit("gameServerError", errorMessage);
}