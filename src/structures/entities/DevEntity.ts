import { Entity, PrimaryKey, Property, AnyEntity } from 'mikro-orm';
import Base from './BaseEntity';
import { EntityProps } from '../Database';

export type Blacklistable = 'users' | 'guilds' | 'commands';

@Entity()
export default class DevEntity extends Base implements AnyEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  restart?: {
    channel: string;
    message: string;
  };

  @Property()
  blacklisted?: {
    users: string[];
    guilds: string[];
    commands: string[];
  };

  constructor(id: string, data: EntityProps<DevEntity> = {}) {
    super();
    this.id = id;
    Object.assign(this, data);
  }
}
