import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env[`stage.${process.env.STAGE}.REDIS_HOST`] || 'localhost',
  port: parseInt(process.env[`stage.${process.env.STAGE}.REDIS_PORT`] || '6379', 10),
 password: process.env[`stage.${process.env.STAGE}.REDIS_PASSWORD`] || 1234,
  db: parseInt(process.env[`stage.${process.env.STAGE}.REDIS_DB`] || '0', 10),
  ttl: parseInt(process.env[`stage.${process.env.STAGE}.REDIS_TTL`] || '300', 10), 
  keyPrefix: 'task-manager:',
}));