import * as redis from 'redis'

let _redis: any = {
  usable: process.env.REDIS_HOST && process.env.REDIS_PORT ? true : false,
  prefix: 'recommendation'
}

const set = async (key: string, value: string, time: number = 3) => {
  return new Promise(async (resolve: any, reject: any) => {

    if (!_redis.usable) {
      return resolve(null)
    }

    let pkey: any = `${_redis.prefix}:${key}`

    await global.redis.set(pkey, value)
    await global.redis.expire(pkey, Number(time) * 60)

    resolve(true)
  })
}

const get = async (key: string, needParse: boolean = false) => {
  return new Promise(async (resolve: any, reject: any) => {

    if (!_redis.usable) {
      return resolve(null)
    }

    let item = await global.redis.get(`${_redis.prefix}:${key}`)

    if (needParse) {
      try {
        item = JSON.parse(item)
      } catch (e) {
        console.error(`Redis can't parse item`, key)
        item = null
      }

      try {
        item.cached = true
      } catch {}
    }

    resolve(item)
  })
}

const del = async (key: string) => {
  if (!_redis.usable) {
    return null
  }

  key = key.replace(/(\-\d{4}\-).+$/, '*')
  const keys = await global.redis.keys(`${_redis.prefix}:${key}*`)
  if (!keys?.length) {
    return false as any
  }

  await global.redis.del(keys)
}

const flushCache = async () => {
  if (!_redis.usable) {
    return null
  }

  const keys = await global.redis.keys(`${_redis.prefix}:articles:*`)
  const deleted = await global.redis.del(keys)
  return deleted
}

const getTTL = async (key: string) => {
  if (!_redis.usable) {
    return null
  }

  let pkey: any = `${_redis.prefix}:${key}`

  let ttl = await global.redis.ttl(pkey)

  return ttl
}

const createClient = async () => {
  let db = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` })

  db.on('error', (err: any) => { console.log('Time', new Date().toLocaleString('pt-BR'), 'Error establishing a redis database connection.', err) })
  db.on('end', () => { console.log('Time', new Date().toLocaleString('pt-BR'), 'Redis client disconnected.') })
  db.on('ready', () => { console.log('Time', new Date().toLocaleString('pt-BR'), 'Redis client successfully connected with database') })
  db.on('reconnecting', () => { console.log('Time', new Date().toLocaleString('pt-BR'), 'reconnecting') })

  await db.connect()

  return db
}

export { set as SetRedis, get as GetRedis, del as DelRedis, flushCache as FlushCache, getTTL as GetTTL, createClient as CreateClientRedis }

declare global {
  var redis: any
}
