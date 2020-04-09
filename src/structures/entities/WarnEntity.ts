import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';

export interface Warn {
  at: Date;
  reason?: string;
  warner: string;
}

@Entity()
export default class WarnEntity implements AnyEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  history!: Warn[];

  @ManyToOne()
  guild!: GuildEntity;

  constructor(data: EntityProps<WarnEntity> = {}) {
    Object.assign(this, data);
  }
}
