import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';
import { v4 } from 'uuid';

export interface Warn {
  at: Date;
  reason?: string;
  warner: string;
}

@Entity()
export default class WarnEntity implements AnyEntity {
  @PrimaryKey()
  id = v4();

  @Property()
  member!: string;

  @Property()
  history!: Warn[];

  @ManyToOne()
  guild!: GuildEntity;

  constructor(data: EntityProps<WarnEntity> = {}) {
    Object.assign(this, data);
  }
}
