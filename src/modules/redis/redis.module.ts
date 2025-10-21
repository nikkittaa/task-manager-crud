import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import redisConfig from '../../config/redis.config';
import { RedisPubSubService } from './redis-pubsub.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    RedisService,
    {
      provide: 'KEYV_REDIS',
      useFactory: (configService: ConfigService) => {
        const redis = configService.get('redis') as any;
        const keyv = new Keyv({
          store: new KeyvRedis(
            `redis://${redis.password ? `:${redis.password}@` : ''}${redis.host}:${redis.port}/${redis.db}`
          ),
          ttl: redis.ttl * 1000, // TTL in milliseconds
          namespace: redis.keyPrefix,
        });
        return keyv;
      },
      inject: [ConfigService],
    },
    RedisPubSubService
    ,
  ],
  exports: [RedisService, RedisPubSubService],
})
export class RedisModule {}
