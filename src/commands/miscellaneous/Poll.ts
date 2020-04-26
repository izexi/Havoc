import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import Util from '../../util';
import { MAX_LIMITS, PROMPT_ENTER } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Create a poll with options.',
      promptOnly: true,
      args: [
        {
          name: 'question',
          type: Target.TEXT,
          prompt: PROMPT_ENTER('the question that you would like to poll')
        },
        {
          name: 'options (option1;option2;...)',
          example: ['yes;no'],
          type: message => message.text.split(';'),
          prompt: PROMPT_ENTER(
            'the options seperated by `;`, e.g: `yes;no` would be options yes and no'
          )
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
    if (formattedOptions.length > MAX_LIMITS.POLL_OPTIONS)
      return message.respond('the maximum amount of options allowed are 10');

    message.sendEmbed({
      setAuthor: [`Poll started by ${message.author.tag}`, message.author.pfp],
      setDescription: `${question}\n\n${formattedOptions.join('\n')}`,
      setFooter: 'Started at:'
    });
  }
}
