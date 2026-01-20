import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UnVerifiedUsersCleanUpCron {
  private readonly logger = new Logger(UnVerifiedUsersCleanUpCron.name);

  constructor(private readonly users: UsersService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async removeUnverifiedUsers() {
    const deletedCount = await this.users.deleteUnverifiedUsers();
    if (deletedCount > 0) {
      this.logger.log(`Deleted ${deletedCount} unverified users`);
    } else {
      this.logger.log(`No deleted`);
    }
  }
}
