export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  ttl?: number;
  keyPrefix?: string;
}
