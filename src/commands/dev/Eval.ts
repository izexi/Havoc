import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { inspect } from 'util';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Evals stuff.',
      aliases: ['ev'],
      args: {
        type: Target.TEXT,
        required: true,
        prompt: 'enter the code that you would like to evaluate.'
      },
      flags: ['silent', 'detailed']
    });
  }

  async run({
    message,
    text: code,
    flags
  }: {
    message: HavocMessage;
    text: string;
    flags: { silent?: undefined; detailed?: undefined };
  }) {
    const detailed = 'detailed' in flags;
    const silent = 'silent' in flags;
    const start = process.hrtime.bigint();

    try {
      let evaled = eval(code);
      if (evaled instanceof Promise) evaled = await evaled;
      const end = process.hrtime.bigint();
      const type =
        evaled && typeof evaled === 'object'
          ? evaled.constructor?.name
          : typeof evaled;
      const output = inspect(evaled, {
        depth: 0,
        maxArrayLength: detailed ? Infinity : 100
      }).replace(new RegExp(message.client.token!, 'g'), 'no');

      if (!silent) {
        message.respond({
          setDescription: `**📥 Input**\n${Util.codeblock(
            code,
            'js'
          )}\n**📤 Output**\n${Util.codeblock(output, 'js')}\n${
            detailed
              ? `🔎 **Detailed output** ${await Util.haste(
                  inspect(evaled, { depth: Infinity }),
                  'js'
                )}\n\n`
              : ''
          }**❔ Type:** \`${type}\``,
          setFooter: [
            `executed in ${Number(end - start) / 1000000} milliseconds`,
            message.author.pfp
          ]
        });
      }
    } catch (error) {
      const end = process.hrtime.bigint();
      const formattedError = inspect(error, {
        depth: 0,
        maxArrayLength: 0
      });

      if (!silent) {
        message.respond({
          setDescription: `**📥 Input**\n${Util.codeblock(
            code,
            'js'
          )}\n**❗ Error:**\n${Util.codeblock(formattedError)}`,
          setFooter: [
            `executed in ${Number(end - start) / 1000000} milliseconds`,
            message.author.pfp
          ]
        });
      }
    }
  }
}
