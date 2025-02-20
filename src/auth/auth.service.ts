import { Injectable, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entities';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Use TypeORM Repository
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = this.userRepository.create({
        email: dto.email,
        hash: hash,  // Ensure hash is correctly assigned
      });

      await this.userRepository.save(user);

      return this.signToken(user.id, user.email);
    } catch (error) {
      throw new ForbiddenException('Credentials taken');
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) throw new ForbiddenException('Invalid credentials');

    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, { expiresIn: '15m', secret });

    return { access_token: token };
  }
}
