import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getUnreadNotifications(userId: number) {
     console.log("starting to search user ")
    return await this.notificationRepository.find({
      where: { receiver: { id: userId } },
      order: { createdAt: 'DESC' },
    });

  }

  async markNotificationsAsRead(userId: number) {
    await this.notificationRepository.update(
      { receiver: { id: userId }, isRead: false },
      { isRead: true }
    );
  }
}
