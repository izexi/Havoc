import { Entity, Property, AnyEntity, PrimaryKey, ManyToOne } from 'mikro-orm';
import { EntityProps } from '../Database';
import GuildEntity from './GuildEntity';
import Base from './BaseEntity';
import { v4 } from 'uuid';

@Entity()
export default class TagEntity extends Base implements AnyEntity {
  @PrimaryKey()
  id = v4();

  @Property()
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
