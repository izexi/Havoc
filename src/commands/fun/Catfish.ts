import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import HavocUser from '../../structures/extensions/HavocUser';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: "Returns a Google reverse image search of someone's avatar.",
      aliases: ['cf'],
      args: {
        type: Target.USER,
        required: true,
        prompt:
          "mention the user / enter the users's ID, tag, nickname or username whose avatar you would like to search."
      }
    });
  }

  async run({ message, user }: { message: HavocMessage; user: HavocUser }) {
    message.respond({
      setDescription: `[Image search of ${user.tag}'s avatar](https://images.google.com/searchbyimage?image_url=${user.pfp})`,
      setThumbnail:
        'https://thesocietypages.org/cyborgology/files/2014/05/Dictionary.png',
      setURL: `https://images.google.com/searchbyimage?image_url=${user.pfp}`
    });
  }
}
