import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { inspect } from 'util';
import Util from '../../util';
import { PROMPT_ENTER, EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Evals stuff.',
      dm: true,
      aliases: ['ev'],
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_ENTER('the code that you would like to evaluate'),
      },
      flags: ['silent', 'detailed', 'async'],
    });
  }

  async run({
    message,
    text: code,
    flags,
  }: {
    message: HavocMessage;
    text: string;
    flags: { silent?: undefined; detailed?: undefined; async?: undefined };
  }) {
    const detailed = 'detailed' in flags;
    const silent = 'silent' in flags;
    const async = 'async' in flags;
    const start = process.hrtime.bigint();

    try {
      let evaled = eval(async ? `(async () => {\n${code}\n})()` : code);
      if (evaled instanceof Promise) evaled = await evaled;
      const end = process.hrtime.bigint();
      const type =
        evaled && typeof evaled === 'object'
          ? evaled.constructor?.name
          : typeof evaled;
      const output = inspect(evaled, {
        depth: 0,
        maxArrayLength: detailed ? Infinity : 100,
      }).replace(new RegExp(message.client.token!, 'g'), 'no');

      if (!silent) {
        message.respond({
          setDescription: `**${EMOJIS.INPUT} Input**\n${Util.codeblock(
            code,
            'js'
          )}\n**${EMOJIS.INPUT} Output**\n${Util.codeblock(output, 'js')}\n${
            detailed
              ? `${EMOJIS.DETAILED} **Detailed output** ${await Util.haste(
                  inspect(evaled, { depth: Infinity }),
                  'js'
                )}\n\n`
              : ''
          }**${EMOJIS.TYPE} Type:** \`${type}\``,
          setFooter: [
            `executed in ${Number(end - start) / 1000000} milliseconds`,
            message.author.pfp,
          ],
        });
      }
    } catch (error) {
      const end = process.hrtime.bigint();
      const formattedError = inspect(error, {
        depth: 0,
        maxArrayLength: 0,
      });

      if (!silent) {
        message.respond({
          setDescription: `**${EMOJIS.INPUT} Input**\n${Util.codeblock(
            code,
            'js'
          )}\n**${EMOJIS.ERROR} Error:**\n${Util.codeblock(formattedError)}`,
          setFooter: [
            `executed in ${Number(end - start) / 1000000} milliseconds`,
            message.author.pfp,
          ],
        });
      }
    }
  }
}
