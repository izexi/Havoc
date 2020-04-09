import { MikroORM, AnyEntity, wrap } from 'mikro-orm';
import GuildEntity from './entities/GuildEntity';

export type EntityProps<T> = {
  [prop in Exclude<keyof T, 'createdAt' | 'updatedAt'>]?: T[prop];
};

export default class Database {
  orm!: MikroORM;

  async init() {
    this.orm = await MikroORM.init({
      type: 'postgresql',
      entitiesDirs: ['./dist/structures/entities'],
      entitiesDirsTs: ['./src/structures/entities'],
      dbName: process.env.POSTGRES_DB!,
      clientUrl: process.env.DATABASE_URL
    });
    return this.setup();
  }

  async setup() {
    // await this.drop();
    const { to_regclass: tableExists } = await this.orm.em
      .getConnection()
      .execute(`SELECT to_regclass('public.guild_entity')`)
      .then(([regclass]) => regclass);
    if (!tableExists) {
      await this.orm
        .getSchemaGenerator()
        .getCreateSchemaSQL()
        .then(sql => this.orm.em.getConnection().execute(sql));
    }
  }

  get guildRepo() {
    return this.orm.em.getRepository(GuildEntity);
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
    Entity: new (id: string, opts: EntityProps<T>) => T,
    id: string,
    opts: EntityProps<T>
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
    Entity: new (id: string, opts: EntityProps<T>) => T,
    id: string
  ): Promise<T> {
    return this.orm.em.findOne(Entity, id).then(res => res || null);
  }

  async findOrInsert<T extends AnyEntity>(
    Entity: new (id: string, opts?: EntityProps<T>) => T,
    id: string,
    opts?: EntityProps<T>
  ): Promise<T> {
    let entitiy = await this.find(Entity, id);
    if (!entitiy) {
      entitiy = new Entity(id, opts);
      await this.orm.em.persistAndFlush(entitiy);
    }
    return entitiy;
  }
}
