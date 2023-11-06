import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from 'src/core/interfaces/tokens.interface';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from 'src/core/interfaces/jwt-payload.interface';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Tokens> {
    const { id, role } = await this.usersService.create(signUpDto);
    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      role,
    });

    return { accessToken, refreshToken };
  }

  async signIn(signInDto: SignInDto): Promise<Tokens> {
    const { id, role, password } = await this.usersService.findOneByEmail(
      signInDto.email,
    );

    const isPasswordValid = await verify(password, signInDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      role,
    });

    return { accessToken, refreshToken };
  }

  logOut(userId: string): void {
    this.usersService.update(userId, { token: null });
  }

  async refreshTokens(userId: string, token: string): Promise<Tokens> {
    const { token: hashedRefreshToken, role } =
      await this.usersService.findOne(userId);

    if (!hashedRefreshToken) {
      throw new ForbiddenException('Invalid refresh token');
    }
    const isRefreshTokenValid = await verify(hashedRefreshToken, token);

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Invalid refresh token');
    }
    const { accessToken, refreshToken } = await this.generateTokens({
      id: userId,
      role,
    });

    return { accessToken, refreshToken };
  }

  //#region reusable methods
  private async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(payload, '1d'), //TODO: refactor to ENV
      this.signToken(payload, '7d'),
    ]);
    const hashedRefreshToken = await hash(refreshToken);
    await this.usersService.update(payload.id, { token: hashedRefreshToken });

    return { accessToken, refreshToken };
  }

  private async signToken(payload: JwtPayload, expiresIn: string) {
    return this.jwtService.signAsync(payload, {
      secret: 'some_jwt_secret', //TODO: change to private key
      //   audience: 'audience',
      //   issuer: 'issuer',
      expiresIn,
    });
  }

  //#endregion
}
