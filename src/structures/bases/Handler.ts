import Havoc from '../../client/Havoc';

export default abstract class<T extends { name: string }> {
  client: Havoc;

  holds: Map<T['name'], T> = new Map();

  constructor(client: Havoc) {
    this.client = client;
    this.load();
  }

  abstract load(): Promise<void>;

  abstract find(query: string): T | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract handle(emitter: any): Promise<any>;
}
