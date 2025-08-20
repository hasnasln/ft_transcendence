import { ConnectionHandler } from "./connection";

export function emitError(errorType: string, errorMessage: string, socketId: string) {
    ConnectionHandler.getInstance().getServer().to(socketId).emit(errorType, errorMessage);
}