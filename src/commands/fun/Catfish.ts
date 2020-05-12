import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: "Returns a Google reverse image search of someone's avatar.",
      aliases: ['cf'],
      dm: true,
      args: {
        type: Target.USER,
        required: true,
        prompt: PROMPT_INITIAL[Target.USER](
          'se avatar you would like to search'
        ),
      },
    });
  }

  async run({ message, user }: { message: HavocMessage; user: HavocUser }) {
    message.respond({
      setDescription: `[Image search of ${user.tag}'s avatar](https://images.google.com/searchbyimage?image_url=${user.pfp})`,
      setThumbnail:
        'https://thesocietypages.org/cyborgology/files/2014/05/Dictionary.png',
      setURL: `https://images.google.com/searchbyimage?image_url=${user.pfp}`,
    });
  }
}
