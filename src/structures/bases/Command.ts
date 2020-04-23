import Havoc from '../../client/Havoc';
import { Target, Targets, TargetType, TargetFn } from '../../util/Targetter';
import HavocMessage from '../extensions/HavocMessage';
import Util from '../../util/Util';
import { parse, sep } from 'path';
import { BitFieldResolvable, PermissionString, Message } from 'discord.js';

interface Arg {
  type: TargetType;
  name?: string;
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
  dm?: boolean;
  subParent?: { prompt: string; subCommands: string[] };
  args?: Arg | Arg[];
  flags?: string[];
  requiredPerms?: BitFieldResolvable<PermissionString>;
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

  requiredPerms?: CommandOptions['requiredPerms'];

  subParent?: CommandOptions['subParent'];

  promptOnly: boolean;

  args: Arg[];

  sub: boolean;

  dm: boolean;

  constructor(__path: string, options: CommandOptions) {
    const { name, dir } = parse(__path);
    this.name = name.toLowerCase();
    this.category = dir.split(sep).pop()!;
    this.aliases = new Set(options.aliases);
    this.flags = options.flags ?? [];
    this.description = options.description;
    this.requiredPerms = options.requiredPerms;
    this.promptOnly = options.promptOnly ?? false;
    this.args = Util.arrayify(options.args);
    this.sub = options.sub ?? false;
    this.dm = options.dm ?? false;
    this.subParent = options.subParent;
  }

  abstract async run(
    this: Havoc,
    params: CommandParams
  ): Promise<void | HavocMessage | Message>;
}
