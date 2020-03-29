import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Create a poll with options.',
      promptOnly: true,
      args: [
        {
          type: Target.TEXT,
          prompt: 'enter the question that you would like to poll.'
        },
        {
          type: (message: HavocMessage) => message.text.split(';'),
          prompt:
            'enter the options seperated by `;`, e.g: `yes;no` would be options yes and no'
        }
      ]
    });
  }

  async run({
    message,
    text: question,
    fn: options
  }: {
    message: HavocMessage;
    text: string;
    fn: string[];
  }) {
    const formattedOptions = options.map(
      (opt, i) => `${Util.emojiNumber(i + 1)} ${opt}`
    );
    if (formattedOptions.length > 10) {
      message.respond('the maximum amount of options allowed are 10');
    } else {
      message.sendEmbed({
        setAuthor: [
          `Poll started by ${message.author.tag}`,
          message.author.pfp
        ],
        setDescription: `${question}\n\n${formattedOptions.join('\n')}`,
        setFooter: 'Started at:'
      });
    }
  }
}
