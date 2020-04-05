import { Property } from 'mikro-orm';

export default abstract class Base {
  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
