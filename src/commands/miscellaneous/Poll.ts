import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { MAX_LIMITS, PROMPT_ENTER, EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Create a poll for a question with options, which can inputted through the prompts invoked by using this command.',
      promptOnly: true,
      args: [
        {
          name: 'question',
          required: true,
          type: Target.TEXT,
          prompt: PROMPT_ENTER('the question that you would like to poll'),
        },
        {
          name: 'options (option1;option2;...)',
          example: ['yes;no'],
          required: true,
          type: (message) => message.text.split(';'),
          prompt: PROMPT_ENTER(
            'the options seperated by `;`, e.g: `yes;no` would be options yes and no'
          ),
        },
      ],
    });
  }

  async run({
    message,
    text: question,
    fn: options,
  }: {
    message: HavocMessage;
    text: string;
    fn: string[];
  }) {
    const formattedOptions = options.map(
      (opt, i) => `${EMOJIS.NUMBERS[i]} ${opt}`
    );
    if (formattedOptions.length > MAX_LIMITS.POLL_OPTIONS)
      return message.respond('the maximum amount of options allowed are 10');

    const poll = await message.respond(
      {
        setAuthor: [
          `Poll started by ${message.author.tag}`,
          message.author.pfp,
        ],
        setDescription: `${question}\n\n${formattedOptions.join('\n')}`,
        setFooter: 'Started at:',
      },
      { author: false, deleteable: false }
    );

    for (const i of Array(options.length).keys())
      await poll.safeReact(EMOJIS.NUMBERS[i]);
  }
}
