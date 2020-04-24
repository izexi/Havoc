import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View or change the current prefix.',
      args: {
        example: ['-'],
        name: 'new prefix',
        type: Target.TEXT
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      text: prefix
    }: {
      message: HavocMessage;
      text: string | null;
    }
  ) {
    if (!prefix)
      return message.respond(
        `my current prefix for this server is \`${message.guild!.prefix}\`.`
      );

    if (prefix === message.prefix)
      return message.respond(
        `my current prefix for this server is already \`${message.prefix}\`.`
      );

    const guildEntity = await this.db.find(GuildEntity, message.guild!.id);

    if (guildEntity?.prefix && prefix === process.env.PREFIX) {
      delete guildEntity.prefix;
      await this.db.flush();
    } else {
      await this.db.upsert(GuildEntity, message.guild!.id, { prefix });
    }

    message.guild!.prefix = prefix;
    message.respond(`I have updated this server's prefix to \`${prefix}\`.`);
  }
}
