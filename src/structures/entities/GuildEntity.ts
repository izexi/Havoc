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
import MuteEntity from './MuteEntity';
import GiveawayEntity from './GiveawayEntity';

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
  giveaway?: string;

  @Property()
  bcPrefixes?: string[];

  @OneToMany(
    () => MuteEntity,
    mute => mute.guild,
    { orphanRemoval: true }
  )
  mutes = new Collection<MuteEntity>(this);

  @OneToMany(
    () => GiveawayEntity,
    giveaway => giveaway.guild,
    { orphanRemoval: true }
  )
  giveaways = new Collection<GiveawayEntity>(this);

  constructor(id: string, data: EntityProps<GuildEntity> = {}) {
    super();
    this.id = id;
    Object.assign(this, data);
  }
}
