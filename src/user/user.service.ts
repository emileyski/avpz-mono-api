import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'argon2';
import { Roles } from 'src/core/enums/roles.enum';
import { StrategyTypes } from 'src/core/enums/strategy.enum';
import { Genders } from 'src/core/enums/gender.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async signupWithAnotherProvider(
    user: any,
    strategy: StrategyTypes,
  ): Promise<User> {
    const { name, email, nickname } = user;
    const userExists = await this.usersRepository.findOneBy({ email });
    if (userExists) {
      throw new ConflictException('User with this email is already exists');
    }

    const newUser = this.usersRepository.create({
      name,
      email,
      nickname,
      strategy: strategy,
    });

    return await this.usersRepository.save(newUser);
  }

  // async signupWithGoogle(user: any): Promise<User> {
  //   const { name, email, nickname } = user;
  //   const userExists = await this.usersRepository.findOneBy({ email });
  //   if (userExists) {
  //     throw new ConflictException('User with this email is already exists');
  //   }

  //   const newUser = this.usersRepository.create({
  //     name,
  //     email,
  //     nickname,
  //     strategy: StrategyTypes.GOOGLE,
  //   });

  //   return await this.usersRepository.save(newUser);
  // }
  async getAll(name?: string, nickname?: string): Promise<any[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.name as name',
        'user.nickname as nickname',
        'user.email as email',
        'user.role as role',
        'user.picture as picture',
        'COUNT(DISTINCT articles.id) as articlesCount',
        'COUNT(DISTINCT posts.id) as postsCount',
      ])
      .leftJoin('user.articles', 'articles')
      .leftJoin('user.posts', 'posts')
      .groupBy('user.id'); // Group by user.id to avoid the error

    if (name) {
      queryBuilder.andWhere('LOWER(user.name) ILIKE LOWER(:name)', {
        name: `%${name.toLowerCase()}%`,
      });
    }

    if (nickname) {
      queryBuilder.andWhere('LOWER(user.nickname) ILIKE LOWER(:nickname)', {
        nickname: `%${nickname.toLowerCase()}%`,
      });
    }

    const users = await queryBuilder.getRawMany(); // Use getRawMany() to return raw results

    users.forEach((user) => {
      if (user.picture) {
        const API_URL = process.env.API_URL || 'http://localhost:3000';
        user.picture = `${API_URL}/api/files/${user.picture}`;
      }
    });

    return users;
  }

  async getRandomUsers(count?: number): Promise<any[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.name as name',
        'user.nickname as nickname',
        'user.email as email',
        'user.role as role',
        'user.picture as picture',
        'COUNT(DISTINCT articles.id) as articlesCount',
        'COUNT(DISTINCT posts.id) as postsCount',
      ])
      .leftJoin('user.articles', 'articles')
      .leftJoin('user.posts', 'posts')
      .groupBy('user.id') // Group by user.id to avoid the error
      .orderBy('RANDOM()') // Order randomly
      .limit(count || 10); // Limit to 10 users

    const users = await queryBuilder.getRawMany(); // Use getRawMany() to return raw results

    users.forEach((user) => {
      if (user.picture) {
        const API_URL = process.env.API_URL || 'http://localhost:3000';
        user.picture = `${API_URL}/api/files/${user.picture}`;
      }
    });

    return users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await hash(createUserDto.password);
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return await this.usersRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new ConflictException(
        'User with this email or nickname is already exists',
      );
    }
  }

  async setPicture(id: string, picture: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    user.picture = picture;
    return await this.usersRepository.save(user);
  }

  async updateNickname(id: string, nickname: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { nickname });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updateName(id: string, name: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { name });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      const hashedPassword = await hash(password);
      this.usersRepository.merge(user, { password: hashedPassword });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updateBirthDate(id: string, birthDate: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { birthDate });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updateAbout(id: string, about: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { about });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updateGender(id: string, gender: Genders): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { gender });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updateEmail(id: string, email: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { email });
      const updatedUser = await this.usersRepository.save(user);
      return this.removeCredentials(updatedUser);
    } catch (error) {
      throw new ConflictException('Some error occured while updating user');
    }
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    try {
      this.usersRepository.merge(user, { token: refreshToken });
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new ConflictException(
        'Some error occured while updating user token',
      );
    }
  }

  async setRole(id: string, role: Roles): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    user.token = undefined;
    return await this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneOrThrowByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });

    return user;
  }

  removeCredentials(user: User): User {
    delete user.password;
    delete user.token;
    return user;
  }
}
