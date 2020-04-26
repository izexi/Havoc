import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { PROMPT_ENTER } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Creates a role with the inputted text as the name.',
      aliases: ['cr'],
      args: {
        type: Target.TEXT,
        required: true,
        prompt: PROMPT_ENTER(
          'the name that you would like to name the new role'
        )
      },
      requiredPerms: 'MANAGE_ROLES'
    });
  }

  async run({ message, text }: { message: HavocMessage; text: string }) {
    message
      .guild!.roles.create({
        data: { name: text.substring(0, 100) },
        reason: `Created By ${message.author.tag}`
      })
      .then(({ name }) =>
        message.respond(`I have created a new role named \`${name}\`.`)
      );
  }
}
