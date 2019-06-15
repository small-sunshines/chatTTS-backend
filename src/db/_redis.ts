import { default as bluebird } from "bluebird"
import * as Redis from "redis"

declare module "redis" {
// tslint:disable-next-line: interface-name
  export interface RedisClient extends NodeJS.EventEmitter {
    getAsync(key: string): Promise<string|null>
    setAsync(key: string, value: string, mode?: string, duration?: number): Promise<any>
  }
}

const redisConfig = {
  db: parseInt(process.env.redis_db!),
  host: process.env.redis_host!,
  password: process.env.redis_pw!,
  port: parseInt(process.env.redis_port!),
}

if (redisConfig.password === "") {
  delete redisConfig.password
}

const oldRedis = Redis.createClient(redisConfig)
const db = bluebird.promisifyAll(oldRedis) as Redis.RedisClient

export default db
