import { Module } from "@nestjs/common";
import { TwilioService } from "./twilio.service";

@Module({
  providers: [TwilioService],
  exports: [TwilioService], // Export it for use in other modules
})
export class TwilioModule {}
