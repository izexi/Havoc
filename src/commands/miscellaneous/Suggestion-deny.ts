import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { review, getSuggestionMsg } from './Suggestion-approve';
import { PROMPT_ENTER } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Denies a suggestion with an optional reason.',
      aliases: ['s-deny', 'suggest-deny'],
      args: [
        {
          name: 'ID',
          example: ['5637006579059427073'],
          type: getSuggestionMsg,
          required: true,
          promptOpts: {
            initial: PROMPT_ENTER(
              "the ID of the suggestion which you can find on the footer of the suggestion's embed, followed by the reason of approval (optional)"
            ),
            invalid:
              "I couldn't find any suggestions that corresponds the ID that you entered https://i.imgur.com/IK7JkVw.png"
          }
        },
        {
          name: 'reason',
          type: Target.TEXT
        }
      ],
      sub: true
    });
  }

  async run({
    message,
    fn: suggestionMsg,
    text: reason
  }: {
    message: HavocMessage;
    fn: HavocMessage;
    text?: string;
  }) {
    await message.delete();
    review(suggestionMsg, reason, false, message.author.tag);
  }
}
