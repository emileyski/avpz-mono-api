// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { JwtService } from '@nestjs/jwt';
// import { WsException } from '@nestjs/websockets';
// import { Socket } from 'socket.io';

// @Injectable()
// export class WsAccessTokenGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly jwtService: JwtService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (isPublic) {
//       return true;
//     }

//     const client: Socket = context.switchToWs().getClient();

//     const token = client.handshake.headers.authorization;

//     if (!token) {
//       throw new WsException('Unauthorized');
//     }

//     try {
//       const decoded = this.jwtService.verify(token);
//       client.data.user = decoded; // Attach user data to the socket
//       return true;
//     } catch (error) {
//       throw new WsException('Unauthorized');
//     }
//   }
// }
