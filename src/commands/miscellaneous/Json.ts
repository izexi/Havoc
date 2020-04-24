import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { URL } from 'url';
import fetch from 'node-fetch';
import Util from '../../util/Util';
import { MAX_LIMITS } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description:
        'View a pretty printed JSON that is parsed from the entered URL.',
      args: {
        name: 'url',
        example: ['https://jsonplaceholder.typicode.com/todos/1'],
        type: ({ arg }) => {
          const possibleUrl = arg;
          if (!possibleUrl) return;
          try {
            new URL(possibleUrl);
            return possibleUrl;
          } catch {
            return null;
          }
        },
        required: true,
        promptOpts: {
          initial: 'enter the URL.',
          invalid: 'You need to enter a valid absolute URL.'
        }
      }
    });
  }

  async run({ message, fn: url }: { message: HavocMessage; fn: string }) {
    const json = await fetch(url)
      .then(res => {
        if (!res.headers.get('content-type')?.includes('application/json'))
          return `**${message.author.tag}** I couldn't find any JSON to parse on \`${url}\`.`;
        return res.json();
      })
      .catch(
        err =>
          `**${message.author.tag}** I ran into an error while trying to access \`${url}\` \n\`${err}\``
      );
    if (typeof json === 'string') return message.respond(json);

    const formattedJSON = JSON.stringify(json, null, 2);
    message.send({
      embed: message.constructEmbed({
        setDescription: (Util as { [key: string]: Function })[
          json.length > MAX_LIMITS.JSON_EMBED ? 'haste' : 'codeblock'
        ](formattedJSON, 'json')
      }),
      files: [
        { attachment: Buffer.from(formattedJSON, 'utf8'), name: 'jason.json' }
      ]
    });
  }
}
