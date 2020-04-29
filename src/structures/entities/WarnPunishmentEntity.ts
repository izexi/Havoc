import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';
import { v4 } from 'uuid';

@Entity()
export default class WarnPunishmentEntity implements AnyEntity {
  @PrimaryKey()
  id = v4();

  @Property()
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
