import Havoc from '../../client/Havoc';
import HavocGuild from '../extensions/HavocGuild';
import { EntityProps } from '../Database';
import { AnyEntity } from 'mikro-orm';

export default abstract class Schedule<T extends AnyEntity> {
  client: Havoc;

  constructor(client: Havoc) {
    this.client = client;
  }

  init() {
    return this.load();
  }

  abstract add(guild: HavocGuild, mute: EntityProps<T>): Promise<void>;

  abstract end(entity: T): Promise<void>;

  abstract delete(entity: T): Promise<void>;

  abstract enqueue(entity: T): void;

  abstract load(): Promise<void>;
}
