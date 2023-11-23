import { Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard';

// Define a custom type extending Socket to include the user property
export interface AuthenticatedSocket extends Socket {
  user?: any;
}

export type SocketIOMiddleWare = {
  (client: AuthenticatedSocket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleWare => {
  return (client, next) => {
    try {
      const payload = WsJwtGuard.validateToken(client);
      client.user = payload; // Now TypeScript should recognize the user property
      next();
    } catch (error) {
      next(error);
    }
  };
};
