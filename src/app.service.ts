import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisPubSubService } from './modules/redis/redis-pubsub.service';

@Injectable()
export class AppService  implements OnModuleInit{
  getHello(): string {
    return 'Hello World!';
  }

  constructor(private readonly redisPubSubService: RedisPubSubService) {}

  async onModuleInit() {
    console.log(' AppService initialized, subscribing to Redis...');
    await this.redisPubSubService.subscribe('tasks_channel', (message) => {
      
      console.log('Received event:', message);
    });
  }
}
