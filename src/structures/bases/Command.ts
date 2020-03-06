import Havoc from '../../client/Havoc';
import { Target } from '../../util/Targetter';
import HavocMessage from '../extensions/HavocMessage';
import HavocUser from '../extensions/HavocUser';

interface CommandOptions {
  aliases?: Set<string> | string[];
  description: string;
  args?: { type: Target }[];
}

export interface CommandParams {
  message: HavocMessage;
  [Target.USER]?: HavocUser | null;
}

export default abstract class implements CommandOptions {
  name!: string;

  category!: string;

  aliases: Set<string>;

  description: CommandOptions['description'];

  args: CommandOptions['args'];

  constructor(__path: string, options: CommandOptions) {
    // @ts-ignore
    const { groups } = __path.match(
      /[\\/](?<category>[a-z]+)[\\/](?<name>[a-z]+)\.js/i
    );
    Object.assign(this, groups);
    this.aliases = new Set(options.aliases);
    this.description = options.description;
    this.args = options.args;
  }

  abstract async run(this: Havoc, params: CommandParams): Promise<void>;
}
