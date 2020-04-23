import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      dm: true,
      description:
        '<:widePeepoHappy1:678636233131425805><:widePeepoHappy2:678636283119140864><:widePeepoHappy3:678636320406634516><:widePeepoHappy4:678636358335463445>',
      aliases: [
        '<:widePeepoHappy1:678636233131425805><:widePeepoHappy2:678636283119140864><:widePeepoHappy3:678636320406634516><:widePeepoHappy4:678636358335463445>'
      ]
    });
  }

  async run({ message }: { message: HavocMessage }) {
    message.respond(
      '<:widePeepoHappy1:678636233131425805><:widePeepoHappy2:678636283119140864><:widePeepoHappy3:678636320406634516><:widePeepoHappy4:678636358335463445>',
      false,
      true
    );
  }
}
