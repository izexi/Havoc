import Havoc from '../../client/Havoc';
import HavocGuild from '../extensions/HavocGuild';
import { EntityProps } from '../Database';
import { AnyEntity, Collection } from 'mikro-orm';

export default abstract class Schedule<T extends AnyEntity> {
  client: Havoc;

  tasks: Map<T['id'], NodeJS.Timer> = new Map();

  constructor(client: Havoc) {
    this.client = client;
  }

  init() {
    return this.load();
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

  abstract schedule(entity: T): void;

  abstract start(guild: HavocGuild, mute: EntityProps<T>): Promise<void>;

  abstract end(entity: T): Promise<void>;

  abstract load(): Promise<void>;
}
