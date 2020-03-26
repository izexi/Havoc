import Havoc from '../../client/Havoc';
import { Target, Targets } from '../../util/Targetter';
import HavocMessage from '../extensions/HavocMessage';

interface Arg {
  type: Target;
  required?: boolean;
  prompt?: string;
}

interface CommandOptions {
  aliases?: Set<string> | string[];
  description: string;
  args?: Arg | Arg[];
}

export type CommandParams = {
  [target in Target]?: Targets[target] | null;
} & {
  message: HavocMessage;
};

export default abstract class implements CommandOptions {
  name!: string;

  category!: string;

  aliases: Set<string>;

  description: CommandOptions['description'];

  args?: Arg[];

  constructor(__path: string, options: CommandOptions) {
    // @ts-ignore
    const { groups } = __path.match(
      /[\\/](?<category>[a-z]+)[\\/](?<name>[a-z]+)\.js/i
    );
    Object.assign(this, groups);
    this.aliases = new Set(options.aliases);
    this.description = options.description;
    this.args = [options.args].flat();
  }

  abstract async run(this: Havoc, params: CommandParams): Promise<void>;
}
