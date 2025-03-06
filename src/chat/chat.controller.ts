import { Controller, Post, Body } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post("send")
  async sendMessage(@Body("message") message: string) {
    return this.chatService.sendMessage(message);
  }
}
