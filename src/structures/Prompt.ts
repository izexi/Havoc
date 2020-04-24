import Util, { MaybeArray } from '../util/Util';
import {
  Targets,
  TargetType,
  resolveTarget,
  Target,
  isOther,
  NotOther
} from '../util/Targetter';
import HavocMessage from './extensions/HavocMessage';
import { MessageCollector, Collection, Message } from 'discord.js';
import { Responses } from '../util/Responses';
import { SECONDS } from '../util/Constants';

interface PromptOptions {
  message: HavocMessage;
  initialMsg: MaybeArray<string>;
  invalidMsg?: MaybeArray<string>;
  target: MaybeArray<TargetType>;
  time?: number;
}

export default class {
  message: HavocMessage;

  initialMsgs: string[];

  invalidMsgs: string[];

  targets: TargetType[];

  time: number;

  curr = 0;

  promptMsgs: HavocMessage['id'][] = [];

  responses: { [target in Target]?: Targets[target] } = {};

  editInterval!: NodeJS.Timeout;

  constructor(options: PromptOptions) {
    this.message = options.message;
    this.initialMsgs = Util.arrayify(options.initialMsg);
    this.invalidMsgs = Util.arrayify(options.invalidMsg);
    this.targets = [options.target] as TargetType[];
    this.time = options.time ?? SECONDS(30);
  }

  async create() {
    const { message } = this;
    // @ts-ignore
    message.channel.prompts.add(message.author.id);
    const promptEmbed = await message.sendEmbed({
      setDescription: `**${message.author.tag}** ${
        this.initialMsgs[this.curr]
      }`,
      setFooter: `You have ${this.time /
        SECONDS(1)} seconds left to enter an option.`
    });
    this.promptMsgs.push(promptEmbed.id);

    let timeRemaining = this.time;
    this.editInterval = message.client.setInterval(async () => {
      if (!timeRemaining || promptEmbed.deleted)
        return clearInterval(this.editInterval);
      await promptEmbed.edit(
        promptEmbed.embeds[0].setFooter(
          `You have ${(timeRemaining -= SECONDS(5)) /
            SECONDS(1)} seconds left to enter an option.`
        )
      );
    }, SECONDS(5));

    return this.collect(
      message.channel.createMessageCollector(
        msg => message.author.id === msg.author.id,
        { time: this.time }
      )
    );
  }

  async collect(collector: MessageCollector): Promise<this['responses']> {
    collector.on('end', this.cleanup);
    for await (const collected of collector) {
      const message = collected as HavocMessage;
      this.promptMsgs.push(message.id);

      if (message.content.toLowerCase() === 'cancel') {
        await this.message.safeReact('❌');
        collector.stop();
      } else {
        const target = this.targets[this.curr];
        const found = await resolveTarget(this.responses, target, message);

        if (found == null) {
          message
            .sendEmbed({
              setDescription: `**${message.author.tag}** \`${
                message.content
              }\` is an invalid option!\n${this.invalidMsgs[this.curr] ??
                (isOther(target)
                  ? ''
                  : Responses[target as NotOther]!(
                      message
                    ))}\nEnter \`cancel\` to exit out of this prompt.`
            })
            .then(msg => this.promptMsgs.push(msg.id));
        } else {
          collector.stop();
          if (this.initialMsgs[++this.curr]) return this.create();
        }
      }
    }
    // @ts-ignore
    this.message.channel.prompts.delete(this.message.author.id);
    return this.responses;
  }

  cleanup = async (_: Collection<Message['id'], Message>, reason: string) => {
    const { message } = this;
    // @ts-ignore
    message.channel.prompts.delete(this.message.author.id);
    message.client.clearInterval(this.editInterval);
    await message.channel.bulkDelete(this.promptMsgs);

    if (reason === 'time') {
      if (!message.deleted) await message.reactions.removeAll();
      message.safeReact('⏱');
      message.respond(
        `it have been over ${this.time /
          SECONDS(
            1
          )} seconds and you did not enter a valid option, so I will go ahead and cancel this.`
      );
    }
  };
}
