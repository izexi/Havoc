import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';
import TagEntity from '../../structures/entities/TagEntity';
import { PROMPT_ENTER } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Add a tag to the server.',
      args: [
        {
          name: 'name',
          example: ['name', '"a name with spaces"'],
          type: message => {
            const name = message.arg;
            if (name && !name.startsWith('"')) return message.shiftArg(name);

            const endIndex = message.args.findIndex(arg => arg.endsWith('"'));
            if (endIndex === -1) return message.shiftArg(name);

            return message.args
              .splice(0, endIndex + 1)
              .join(' ')
              .slice(1, -1);
          },
          required: true,
          prompt: PROMPT_ENTER(
            'what you would like to name the tag, e.g: `name` or `"a name"`'
          )
        },
        {
          name: 'content',
          type: Target.TEXT,
          required: true,
          prompt: PROMPT_ENTER(
            'what you would like the content of the tag to be'
          )
        }
      ],
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      fn: name,
      text: content
    }: { message: HavocMessage; fn: string; text: string }
  ) {
    if (message.guild!.tags.has(name))
      return message.respond(`A tag with the name \`${name}\` already exists.`);

    if (this.commandHandler.find(name))
      return message.respond(
        `\`${name}\` is already a command, so you can't use this as a tag name.`
      );

    message.guild!.tags.set(name, content);
    const guild = await this.db.findOrInsert(GuildEntity, message.guild!.id);
    await guild.tags.init();
    guild.tags.add(
      new TagEntity({
        name,
        content,
        createdBy: message.author.id
      })
    );
    await this.db.flush();

    message.respond(
      `I have created the tag \`${name}\` which you can trigger by entering \`${message.prefix}${name}\``
    );
  }
}
