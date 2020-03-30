import { Entity, PrimaryKey, Property, AnyEntity } from 'mikro-orm';
import BaseEntity from './BaseEntity';

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

  constructor(
    id: string,
    { logs, suggestion }: { logs?: Logs; suggestion?: string } = {}
  ) {
    super();
    this.id = id;
    this.logs = logs;
    this.suggestion = suggestion;
  }
}
