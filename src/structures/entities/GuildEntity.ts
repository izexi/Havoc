import {
  Entity,
  PrimaryKey,
  Property,
  AnyEntity,
  OneToMany,
  Collection,
} from 'mikro-orm';
import BaseEntity from './BaseEntity';
import { EntityProps } from '../Database';
import MuteEntity from './MuteEntity';
import GiveawayEntity from './GiveawayEntity';
import WarnEntity from './WarnEntity';
import WarnPunishmentEntity from './WarnPunishmentEntity';
import TagEntity from './TagEntity';

export interface Logs {
  disabled: number[];
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
  deletedAt?: Date;

  @Property()
  prefix?: string;

  @Property()
  welcomer?: string;

  @Property()
  logs?: Logs;

  @Property()
  suggestion?: string;

  @Property()
  giveaway?: string;

  @Property()
  autorole?: string;

  @Property()
  modlogs?: string;

  @Property()
  bcPrefixes?: string[];

  @OneToMany(() => MuteEntity, (mute) => mute.guild, { orphanRemoval: true })
  mutes = new Collection<MuteEntity>(this);

  @OneToMany(() => TagEntity, (tag) => tag.guild, { orphanRemoval: true })
  tags = new Collection<TagEntity>(this);

  @OneToMany(() => GiveawayEntity, (giveaway) => giveaway.guild, {
    orphanRemoval: true,
  })
  giveaways = new Collection<GiveawayEntity>(this);

  @OneToMany(() => WarnEntity, (warn) => warn.guild, { orphanRemoval: true })
  warns = new Collection<WarnEntity>(this);

  @OneToMany(
    () => WarnPunishmentEntity,
    (warnPunishment) => warnPunishment.guild,
    { orphanRemoval: true }
  )
  warnPunishments = new Collection<WarnPunishmentEntity>(this);

  constructor(id: string, data: EntityProps<GuildEntity> = {}) {
    super();
    this.id = id;
    Object.assign(this, data);
  }
}
