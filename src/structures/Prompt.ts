import Util, { MaybeArray } from '../util/Util';
import { Targets, TargetType, resolveTarget, Target } from '../util/Targetter';
import HavocMessage from './extensions/HavocMessage';
import { MessageCollector, Collection, Message } from 'discord.js';
import { Responses } from '../util/Responses';

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
    this.targets = Util.arrayify(options.target);
    this.time = options.time ?? 30000;
  }

  async create() {
    const { message } = this;
    const promptEmbed = await message.sendEmbed({
      setDescription: `**${message.author.tag}** ${
        this.initialMsgs[this.curr]
      }`,
      setFooter: `You have ${this.time / 1000} seconds left to enter an option.`
    });
    this.promptMsgs.push(promptEmbed.id);

    let timeRemaining = this.time;
    this.editInterval = message.client.setInterval(async () => {
      if (!timeRemaining) return clearInterval(this.editInterval);
      await promptEmbed.edit(
        promptEmbed.embeds[0].setFooter(
          `You have ${(timeRemaining -= 5000) /
            1000} seconds left to enter an option.`
        )
      );
    }, 5000);

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
        await this.message.react('❌');
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
                (typeof target === 'function'
                  ? ''
                  : Responses[target]!(
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
    return this.responses;
  }

  cleanup = async (_: Collection<Message['id'], Message>, reason: string) => {
    const { message } = this;

    message.client.clearInterval(this.editInterval);
    await message.channel.bulkDelete(this.promptMsgs);

    if (reason === 'time') {
      if (!message.deleted) await message.reactions.removeAll();
      message.react('⏱');
      message.respond(
        `it have been over ${this.time /
          1000} seconds and you did not enter a valid option, so I will go ahead and cancel this.`
      );
    }
  };
}
