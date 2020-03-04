import Havoc from '../../client/Havoc';
import { Message } from 'discord.js';

interface CommandOptions {
  aliases?: Set<string> | string[];
  description: string;
}

export default abstract class implements CommandOptions {
  name!: string;

  category!: string;

  aliases: Set<string>;

  description: string;

  constructor(__path: string, options: CommandOptions) {
    // @ts-ignore
    const { groups } = __path.match(
      /[\\/](?<category>[a-z]+)[\\/](?<name>[a-z]+)\.js/i
    );
    Object.assign(this, groups);
    this.aliases = new Set(options.aliases);
    this.description = options.description;
  }

  abstract async run(this: Havoc, params: { message: Message }): Promise<void>;
}
