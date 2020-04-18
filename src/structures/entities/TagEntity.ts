import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';
import Base from './BaseEntity';

@Entity()
export default class TagEntity extends Base implements AnyEntity {
  @PrimaryKey()
  name!: string;

  @Property()
  content!: string;

  @Property()
  createdBy!: string;

  @Property()
  updatedBy?: string;

  @ManyToOne()
  guild!: GuildEntity;

  constructor(data: EntityProps<TagEntity> = {}) {
    super();
    Object.assign(this, data);
  }
}
