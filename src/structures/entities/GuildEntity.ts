import {
  Entity,
  PrimaryKey,
  Property,
  AnyEntity,
  OneToMany,
  Collection
} from 'mikro-orm';
import BaseEntity from './BaseEntity';
import { EntityProps } from '../Database';
import Mute from './MuteEntity';

export interface Logs {
  channel: string;
  webhook: {
    id: string;
    token: string;
  };
}

@Entity()
export default class GuildEntity extends BaseEntity implements AnyEntity {
  @PrimaryKey()
  id: string;

  @Property()
  logs?: Logs;

  @Property()
  suggestion?: string;

  @Property()
  bcPrefixes?: string[];

  @OneToMany(
    () => Mute,
    mute => mute.guild,
    { orphanRemoval: true }
  )
  mutes = new Collection<Mute>(this);

  constructor(id: string, data: EntityProps<GuildEntity> = {}) {
    super();
    this.id = id;
    this.logs = data.logs;
    this.suggestion = data.suggestion;
    this.bcPrefixes = data.bcPrefixes;
  }
}
