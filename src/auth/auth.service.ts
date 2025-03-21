import { Injectable, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entities';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WalletService } from 'src/wallet/wallet.service';
import { TwilioService } from 'src/twilio/twilio.service';
import { Twilio } from 'twilio';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  private twilioClient: Twilio;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwt: JwtService,
    private config: ConfigService,
    private walletService: WalletService,
    private twilioService: TwilioService,
  ) {
    this.twilioClient = new Twilio(
      this.config.get<string>('TWILIO_ACCOUNT_SID'),
      this.config.get<string>('TWILIO_AUTH_TOKEN')
    );
  }

  async signup(dto: AuthDto) {

    console.log('Checking for existing user:', dto.email, dto.phoneNumber);

    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
    });

    if (existingUser) {
      console.log('User already exists:', existingUser); // Log the existing user for debug purposes
      throw new ForbiddenException('Credentials taken');
    }

    const hash = await argon.hash(dto.password);
    console.log(dto.fullName)
    try {
      const user = this.userRepository.create({
        fullName: dto.fullName,
        email: dto.email,
        hash: hash,
        phoneNumber: dto.phoneNumber,
      });

      await this.userRepository.save(user);
      await this.walletService.createWallet(user);

      return this.signToken(user.id, user.fullName, user.email, user.phoneNumber);
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('Credentials taken');
    }
  }


  async signin(dto: AuthDto) {
    const user = await this.userRepository.findOne({
      where: dto.email ? { email: dto.email } : { phoneNumber: dto.phoneNumber },
      relations: ['wallet'],
    });

    if (!user) throw new ForbiddenException('Invalid credentials');

    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException('Invalid credentials');

   // const { verificationId } = await this.sendVerificationCode(user);
     // console.log(verificationId)







    const token = await this.signToken(user.id,user.fullName, user.email, user.phoneNumber);

   return {
      access_token: token.access_token,
      // verificationId
    };

  }

  async signToken(userId: number,fullName:string, email: string, phoneNumber: string): Promise<{ access_token: string }> {
    const payload = { id: userId,fullName, email, phoneNumber };
    const secret = this.config.get<string>('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return { access_token: token };
  }


  async verifySms(phoneNumber: string, code: string) {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    console.log(user , code )
    if (!user || user.smsCode !== code || new Date() > user.smsCodeExpires) {
      console.log("sms code stored in db ..",user.smsCode)
      throw new ForbiddenException('Invalid or expired verification code');
    }

    user.smsCode = null;
    user.smsCodeExpires = null;
    await this.userRepository.save(user);

    return this.signToken(user.id,user.fullName, user.email, user.phoneNumber);
  }

  async sendVerificationCode(user: User) {
    const code = randomInt(100000, 999999).toString();
    const verificationId = randomInt(1000000, 9999999).toString(); // Generate a unique verification ID
    user.smsCode = code; // Store in the database
    user.smsCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 mins
    user.verificationId = verificationId;
    await this.userRepository.save(user);

    await this.twilioClient.messages.create({
      body: `Your verification code is: ${code}`,
      from: this.config.get<string>('TWILIO_PHONE_NUMBER'),
      to: user.phoneNumber,
    });

    return { verificationId, message: 'Verification code sent!' };
  }


}