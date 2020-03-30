/* eslint-disable @typescript-eslint/no-explicit-any */
import { MikroORM, AnyEntity, wrap } from 'mikro-orm';
import GuildConfig from './entities/GuildConfig';
import BaseEntity from './entities/BaseEntity';

export default class Database {
  orm!: MikroORM;

  async init() {
    this.orm = await MikroORM.init({
      type: 'postgresql',
      entities: [BaseEntity, GuildConfig],
      dbName: process.env.POSTGRES_DB!,
      clientUrl: process.env.DATABASE_URL,
      baseDir: __dirname
    });
    return this.setup();
  }

  async setup() {
    const { to_regclass: tableExists } = await this.orm.em
      .getConnection()
      .execute(`SELECT to_regclass('public.guild_config')`)
      .then(([regclass]) => regclass);
    if (!tableExists) {
      await this.orm
        .getSchemaGenerator()
        .getCreateSchemaSQL()
        .then(sql => this.orm.em.getConnection().execute(sql));
    }
  }

  drop() {
    return this.orm
      .getSchemaGenerator()
      .getDropSchemaSQL()
      .then(sql => this.orm.em.getConnection().execute(sql));
  }

  flush() {
    return this.orm.em.flush();
  }

  async upsert<T extends AnyEntity>(
    Entity: new (...args: any[]) => T,
    id: string,
    opts: { [prop in keyof T]?: T[prop] }
  ) {
    const res = await this.orm.em.findOne(Entity, id);
    if (res) {
      wrap(res).assign(opts);
      await this.orm.em.flush();
    } else {
      await this.orm.em.persistAndFlush(new Entity(id, opts));
    }
  }

  async find<T extends AnyEntity>(
    entitiyName: new (...args: any[]) => T,
    id: string
  ): Promise<T> {
    return this.orm.em.findOne(entitiyName, id).then(res => res || null);
  }

  async findOrInsert<T extends AnyEntity>(
    entitiyName: new (...args: any[]) => T,
    id: string,
    ...args: any[]
  ): Promise<T> {
    const entitiy = new entitiyName(id, ...args);
    const found = await this.find(entitiyName, id);
    if (!found) await this.orm.em.persistAndFlush(entitiy);
    return entitiy;
  }
}
