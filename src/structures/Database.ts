import { MikroORM, AnyEntity } from 'mikro-orm';
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

  flush() {
    return this.orm.em.flush();
  }

  async findOrInsert<T extends AnyEntity>(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    entitiyName: new (...args: any[]) => T,
    id: string,
    ...args: any[]
  ): /* eslint-enable @typescript-eslint/no-explicit-any */
  Promise<T> {
    const entitiy = new entitiyName(id, ...args);
    const found = await this.orm.em.findOne(entitiyName, id);
    if (!found) await this.orm.em.persistAndFlush(entitiy);
    return entitiy;
  }
}
