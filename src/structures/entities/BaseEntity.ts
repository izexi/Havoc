import { Property } from 'mikro-orm';

export default abstract class BaseEntity {
  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
