import { Controller, Get, Query, Post, Body, ParseIntPipe, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("count/:userId")
  async getNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  @Post('mark-as-read')
  async markAsRead(@Body('userId') userId: number) {
    return this.notificationService.markNotificationsAsRead(userId);
  }
}
