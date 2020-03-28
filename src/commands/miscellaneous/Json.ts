import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { URL } from 'url';
import fetch from 'node-fetch';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'View a pretty printed JSON that is parsed from the entered URL.',
      args: {
        type: (message: HavocMessage) => {
          try {
            new URL(message.arg);
            return message.arg;
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
    if (typeof json === 'string') {
      message.respond(json);
    } else {
      const formattedJSON = JSON.stringify(json, null, 2);
      message.send({
        embed: message.constructEmbed({
          setDescription: (Util as { [key: string]: Function })[
            json.length > 2036 ? 'haste' : 'codeblock'
          ](formattedJSON, 'json')
        }),
        files: [
          { attachment: Buffer.from(formattedJSON, 'utf8'), name: 'jason.json' }
        ]
      });
    }
  }
}
