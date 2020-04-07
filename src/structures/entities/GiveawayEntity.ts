import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';

@Entity()
export default class GiveawayEntity implements AnyEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  start = new Date();

  @Property()
  end!: Date;

  @Property()
  channel!: string;

  @ManyToOne()
  guild!: GuildEntity;

  @Property()
  message!: string;

  @Property()
  winners!: number;

  constructor(data: EntityProps<GiveawayEntity> = {}) {
    Object.assign(this, data);
  }
}
