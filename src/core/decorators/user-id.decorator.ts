import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const UserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return user.id;
  },
);
