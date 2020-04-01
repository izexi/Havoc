import Havoc from '../../client/Havoc';
import { Target, Targets, TargetType, TargetFn } from '../../util/Targetter';
import HavocMessage from '../extensions/HavocMessage';
import Util from '../../util/Util';
import { parse, sep } from 'path';

interface Arg {
  type: TargetType;
  required?: boolean;
  prompt?: string | ((message: HavocMessage) => string);
  promptOpts?: {
    initial: string;
    invalid: string;
  };
}

interface CommandOptions {
  aliases?: Set<string> | string[];
  description: string;
  promptOnly?: boolean;
  sub?: boolean;
  args?: Arg | Arg[];
  flags?: string[];
}

export type CommandParams = {
  [target in Target]?: Targets[target] | null;
} & {
  target?: TargetFn;
  message: HavocMessage;
};

export enum Status {
  SUBCOMMAND,
  RAN,
  ERROR
}

export default abstract class implements CommandOptions {
  name!: string;

  category!: string;

  aliases: Set<string>;

  flags: string[];

  description: CommandOptions['description'];

  promptOnly: boolean;

  args: Arg[];

  sub: boolean;

  constructor(__path: string, options: CommandOptions) {
    const { name, dir } = parse(__path);
    this.name = name.toLowerCase();
    this.category = dir.split(sep).pop()!;
    this.aliases = new Set(options.aliases);
    this.flags = options.flags ?? [];
    this.description = options.description;
    this.promptOnly = options.promptOnly ?? false;
    this.args = Util.arrayify(options.args);
    this.sub = options.sub ?? false;
  }

  abstract async run(this: Havoc, params: CommandParams): Promise<void>;
}
