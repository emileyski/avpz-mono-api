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
import { FilesService } from 'src/files/files.service';
import { StrategyTypes } from 'src/core/enums/strategy.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    private readonly filesService: FilesService,
  ) {}

  async loginWithAnotherProvider(
    user: any,
    strategy: StrategyTypes,
  ): Promise<Tokens> {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userExists = await this.usersService.findOneByEmail(user.email);
    if (userExists) {
      const { accessToken, refreshToken } = await this.generateTokens({
        id: userExists.id,
        role: userExists.role,
      });
      return { accessToken, refreshToken };
    }

    const { id, role } = await this.usersService.signupWithAnotherProvider(
      user,
      strategy,
    );

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      role,
    });

    return { accessToken, refreshToken };
  }

  async signUp(signUpDto: SignUpDto, picture): Promise<Tokens> {
    const { id, role } = await this.usersService.create(signUpDto);

    if (picture) {
      const { id: pictureId } = await this.filesService.saveOne(picture);
      await this.usersService.setPicture(id, pictureId);
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      role,
    });

    return { accessToken, refreshToken };
  }

  async signIn(signInDto: SignInDto): Promise<Tokens> {
    const { id, role, password } =
      await this.usersService.findOneOrThrowByEmail(signInDto.email);

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
    this.usersService.updateRefreshToken(userId, null);
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
    await this.usersService.updateRefreshToken(payload.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  private async signToken(payload: JwtPayload, expiresIn: string) {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_KEY || 'some_jwt_secret',
      expiresIn,
    });
  }

  //#endregion
}
