import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get('redis');
    
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
    });
  }

  async set(key: string, value: any, ttlMs?: number) {
    if (ttlMs) {
      await this.redis.set(`${key}`, JSON.stringify(value), 'PX', ttlMs);
    } else {
      await this.redis.set(`${key}`, JSON.stringify(value));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(`${key}`);
    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async delPattern(pattern: string) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(keys);
      console.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
    }
  }

  async exists(key: string) {
    return (await this.redis.exists(key)) > 0;
  }
}
