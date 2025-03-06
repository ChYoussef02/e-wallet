import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers: Map<number, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(@MessageBody() data: { userId: number }, @ConnectedSocket() client: Socket) {
    console.log(`User ${data.userId} joined with socket ID: ${client.id}`);
    this.activeUsers.set(data.userId, client.id);
    client.join(`user_${data.userId}`);
  }

  notifyUser(userId: number, message: string) {
    console.log("Active users:", this.activeUsers);
    const socketId = this.activeUsers.get(userId);

    if (socketId) {
      console.log(`Sending notification to user ${userId}`);
      this.server.to(socketId).emit("receiveNotification", message);
    } else {
      console.log(`User ${userId} is not online`);
    }
  }
}
