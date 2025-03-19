import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./entity/chat.entity";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;



  constructor(private readonly config:ConfigService) {
    const apiKey = config.getOrThrow<string>("GEMINI_API_KEY");
   // this.loadFAQ();

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
// to train the bot :

private loadFAQ() {
  const file = fs.readFileSync('./faqs.json', 'utf-8');
  return JSON.parse(file);
}

private findFAQ(question: string): string | null {
  const faqData=this.loadFAQ()
  for (const faq of faqData) {
    if (question.toLowerCase().includes(faq.question.toLowerCase())) {
      return faq.answer;
    }
  }
  return null;
}
async sendMessage(userMessage: string){
  const faqAnswer = this.findFAQ(userMessage);
  if (faqAnswer) {
    return {response:faqAnswer};
  }

  const botResponse = await this.getBotResponse(userMessage);
  return { response: botResponse };
}



    async getBotResponse(message: string): Promise<string> {
      try {
const prompt = `You are a helpful AI assistant for an E-wallet app that allows users to store money, make payments, and manage their finances electronically. Your job is to assist users by answering questions based on the following knowledge base:

### E-Wallet Information:
- E-wallet is an app that allows users to store money, make payments, and perform other financial transactions electronically.
- Users can download the E-wallet app from the **Google Play Store** (Android) and **Apple App Store** (iOS).
- Money can be transferred from the E-wallet to  your Konnect account via the "Withdraw to Bank" option.
- The app is **compatible with Android and iOS devices**, as long as they meet the system requirements.
- Users can **contact customer support** via:
  📧 Email: support@E-wallet.com
  📞 Phone: +21650456573
- Users can add funds to their wallet using **Konnect** by selecting 'Recharge' and following the instructions.

### 🎯 Instructions:
- Answer user questions based **only on the provided details**.
- If a question is **not covered**, politely inform the user that you currently don't have that information.
- Keep responses **concise, clear, and user-friendly**.

        User question: "${message}"
        AI Response: `;

        const result = await this.model.generateContent(prompt);
        console.log(result)
        return result.response.text();
      } catch (error) {
        this.logger.error("Gemini API error:", error);
        return "Sorry, I couldn't process that request. Please try again later.";
      }
    }

}