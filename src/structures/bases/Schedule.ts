import Havoc from '../../client/Havoc';
import HavocGuild from '../extensions/HavocGuild';
import { EntityProps } from '../Database';
import { AnyEntity, Collection } from 'mikro-orm';
import GuildEntity from '../entities/GuildEntity';

export default abstract class Schedule<T extends AnyEntity> {
  client: Havoc;

  tasks: Map<T['id'], NodeJS.Timer> = new Map();

  Entity: new (opts: EntityProps<T>) => T;

  type: 'mutes' | 'giveaways';

  constructor(
    client: Havoc,
    Entity: new (opts: EntityProps<T>) => T,
    type: 'mutes' | 'giveaways'
  ) {
    this.client = client;
    this.Entity = Entity;
    this.type = type;
  }

  init() {
    return this.load();
  }

  schedule(entity: T) {
    this.enqueue(entity, new Date(entity.end).getTime() - Date.now());
    return entity;
  }

  async start(
    guildId: HavocGuild['id'],
    entityProps: Exclude<EntityProps<T>, 'guild'>
  ) {
    const guild = await this.client.db.findOrInsert(GuildEntity, guildId);
    const entity = new this.Entity({ ...entityProps, guild });
    const collection = (guild[this.type] as unknown) as Collection<T>;

    await collection.init();
    collection.add(entity);
    await this.client.db.flush();

    return this.schedule(entity);
  }

  enqueue(entity: T, delay: number) {
    if (!this.tasks.has(entity.id))
      this.tasks.set(
        entity.id,
        this.client.setTimeout(() => this.end(entity), delay)
      );
  }

  async dequeue(entity: T, parent: Collection<T>) {
    const task = this.tasks.get(entity.id);
    if (task) {
      this.client.clearTimeout(task);
      this.tasks.delete(entity.id);
    }
    parent.remove(entity);
    await this.client.db.flush();
  }

  abstract end(entity: T): Promise<void>;

  abstract load(): Promise<void>;
}
