import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { review, getSuggestionMsg } from './Suggestion-approve';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Denies a suggestion with an optional reason.',
      args: [
        {
          type: getSuggestionMsg,
          required: true,
          promptOpts: {
            initial:
              "enter the ID of the suggestion which you can find on the footer of the suggestion's embed, followed by the reason of approval (optional)",
            invalid:
              "I couldn't find any suggestions that corresponds the ID that you entered https://i.imgur.com/IK7JkVw.png"
          }
        },
        {
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
