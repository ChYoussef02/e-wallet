import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./entity/chat.entity";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any; // replace 'any' with a specific type if possible

  constructor(@InjectRepository(Chat) private chatRepo: Repository<Chat>) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.error(
        "GEMINI_API_KEY is not defined in the environment variables."
      );
      throw new Error("GEMINI_API_KEY is missing."); // Exit if API key is absent
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Specify the model here
  }

  async sendMessage(userMessage: string): Promise<Chat> {
    const botResponse = await this.getBotResponse(userMessage);
    console.log("user message :",userMessage)

    const chat = this.chatRepo.create({ userMessage, botResponse });
    console.log("bot Response : ",botResponse)
    return this.chatRepo.save(chat);
  }

  async getBotResponse(message: string): Promise<string> {
    try {
      const result = await this.model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      this.logger.log(`Gemini API response: ${text}`);  // Log the response

      return text;
    } catch (error) {
      this.logger.error("Gemini API error:", error);
      return "Sorry, I couldn't process that request.  Please try again later.";
    }
  }
}