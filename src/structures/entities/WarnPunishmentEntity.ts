import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';

export interface Warn {
  reason: string;
  warner: string;
}

@Entity()
export default class WarnPunishmentEntity implements AnyEntity {
  @PrimaryKey()
  amount!: number;

  @Property()
  punishment!: 'mute' | 'kick' | 'ban';

  @Property()
  duration?: number;

  @ManyToOne()
  guild!: GuildEntity;

  constructor(data: EntityProps<WarnPunishmentEntity> = {}) {
    Object.assign(this, data);
  }
}
