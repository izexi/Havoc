import { MikroORM, AnyEntity, wrap } from 'mikro-orm';
import GuildEntity from './entities/GuildEntity';
import Havoc from '../client/Havoc';

export type EntityProps<T> = {
  [prop in keyof T]?: T[prop];
};
type Entity<T> = new (id: string, opts: EntityProps<T>) => T;

export default class Database {
  client: Havoc;

  orm!: MikroORM;

  constructor(client: Havoc) {
    this.client = client;
  }

  async init() {
    this.orm = await MikroORM.init({
      type: 'postgresql',
      entitiesDirs: ['./dist/structures/entities'],
      entitiesDirsTs: ['./src/structures/entities'],
      dbName: process.env.POSTGRES_DB!,
      clientUrl: process.env.DATABASE_URL,
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
        .then((query) => this.execute(query));
    }
  }

  get guildRepo() {
    return this.orm.em.getRepository(GuildEntity);
  }

  drop() {
    return this.orm
      .getSchemaGenerator()
      .getDropSchemaSQL()
      .then((sql) => this.orm.em.getConnection().execute(sql));
  }

  execute(query: string) {
    return this.orm.em.getConnection().execute(query);
  }

  flush() {
    return this.orm.em.flush().then(
      () => {
        this.client.logger.info('Database flushed', {
          origin: 'Database#flush()',
        });
        this.client.prometheus.dbFlushCounter.inc();
      },
      (error) =>
        this.client.logger.error(error.message, {
          origin: 'Database#flush()',
        })
    );
  }

  async upsert<T extends AnyEntity>(
    Entity: Entity<T>,
    id: string,
    opts: EntityProps<T>
  ) {
    const res = await this.orm.em.findOne(Entity, id);
    if (res) {
      wrap(res).assign(opts);
      return this.flush();
    } else {
      await this.orm.em.persistLater(new Entity(id, opts));
      return this.flush();
    }
  }

  async find<T extends AnyEntity>(Entity: Entity<T>, id: string): Promise<T> {
    return this.orm.em.findOne(Entity, id).then((res) => res || null);
  }

  async findOrInsert<T extends AnyEntity>(
    Entity: new (id: string, opts?: EntityProps<T>) => T,
    id: string,
    opts?: EntityProps<T>
  ): Promise<T> {
    let entitiy = await this.find(Entity, id);
    if (entitiy && opts) {
      wrap(entitiy).assign(
        Object.fromEntries(Object.entries(opts).filter(([k]) => !entitiy[k]))
      );
      await this.flush();
    } else if (!entitiy) {
      entitiy = new Entity(id, opts);
      await this.orm.em.persistAndFlush(entitiy);
    }
    return entitiy;
  }
}
