import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';

@Entity()
export default class WarnPunishmentEntity implements AnyEntity {
  @PrimaryKey()
  amount!: number;

  @Property()
  punishment!: string;

  @Property()
  duration?: number;

  @ManyToOne()
  guild!: GuildEntity;

  constructor(data: EntityProps<WarnPunishmentEntity> = {}) {
    Object.assign(this, data);
  }
}
