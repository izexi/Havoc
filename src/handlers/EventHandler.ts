import Handler from '../structures/bases/Handler';
import { promises as fs } from 'fs';
import { join, parse } from 'path';
import { ClientEvents } from 'discord.js';

export default class extends Handler<
  (...args: ClientEvents[keyof ClientEvents]) => void
> {
  async load() {
    await fs
      .readdir(join(__dirname, '..', 'events'))
      .then((files) => this.loadFromFiles(files))
      .catch((error) =>
        this.client.logger.error(error.message, {
          origin: 'EventHandler#loadFromFiles()',
        })
      );
    this.client.logger.info(`Loaded ${this.holds.size} events`, {
      origin: 'EventHandler#load()',
    });
  }

  loadFromFiles(eventFiles: string[]) {
    this.holds = new Map(
      eventFiles.map((eventFile) => {
        const eventPath = join(__dirname, '..', 'events', eventFile);
        const eventName = parse(eventPath).name as keyof ClientEvents;
        const eventFn = require(eventPath).default.bind(this.client);

        this.client.on(eventName, eventFn);
        return [eventName, eventFn];
      })
    );
  }

  find(name: string) {
    return this.holds.get(name);
  }

  async handle<T extends keyof ClientEvents>(
    eventName: T,
    ...args: ClientEvents[T]
  ) {
    const event = this.holds.get(eventName.toLowerCase());
    if (!event) return this.client.removeAllListeners(eventName);

    event.call(this.client, ...args);
  }
}
