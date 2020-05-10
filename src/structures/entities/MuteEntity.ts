import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';
import { v4 } from 'uuid';

@Entity()
export default class MuteEntity implements AnyEntity {
  @PrimaryKey()
  id = v4();

  @Property()
  start = new Date();

  @Property()
  end?: Date;

  @Property()
  member!: string;

  @ManyToOne()
  guild!: GuildEntity;

  @Property()
  muter!: string;

  @Property()
  reason?: string;

  constructor(data: EntityProps<MuteEntity> = {}) {
    Object.assign(this, data);
  }
}
