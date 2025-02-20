import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet/wallet.module';
import { PaymentModule } from './konnect/payment/payment.module';
import { WebhookModule } from './konnect/webhook/webhook.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
        type:'postgres',
        port: +process.env.DB_PORT ,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: true,
    }),
    AuthModule,
    UserModule,
    PaymentModule,
    WebhookModule,
    WalletModule,

  ],

})
export class AppModule {}

