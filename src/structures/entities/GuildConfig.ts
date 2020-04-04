import { Entity, PrimaryKey, Property, AnyEntity } from 'mikro-orm';
import BaseEntity from './BaseEntity';
import { EntityProps } from '../Database';

export interface Logs {
  channel: string;
  webhook: {
    id: string;
    token: string;
  };
}

@Entity()
export default class GuildConfig extends BaseEntity implements AnyEntity {
  @PrimaryKey()
  id: string;

  @Property()
  logs?: Logs;

  @Property()
  suggestion?: string;

  @Property()
  bcPrefixes?: string[];

  constructor(id: string, props: EntityProps<GuildConfig> = {}) {
    super();
    this.id = id;
    Object.assign(this, props);
  }
}
