import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Delete a tag from the server.',
      args: [
        {
          name: 'name',
          example: ['name', '"a name with spaces"'],
          type: message => {
            let name = message.arg;
            if (name && name.startsWith('"')) {
              const endIndex = message.args.findIndex(arg => arg.endsWith('"'));
              if (endIndex !== -1)
                name = message.args
                  .splice(0, endIndex + 1)
                  .join(' ')
                  .slice(1, -1);
              if (message.guild!.tags.has(name)) return name;
            }

            if (message.guild!.tags.has(name)) return message.shiftArg(name);
          },
          required: true,
          promptOpts: {
            initial:
              'enter the name of the tag you would like to delete, e.g: `name` or `"a name"`',
            invalid: "I couldn't find a tag with that name"
          }
        },
        {
          name: 'new content',
          type: Target.TEXT,
          required: true,
          promptOpts: {
            initial:
              'enter what you would like the new content of the tag to be',
            invalid: 'you need to enter the new content of the tag'
          }
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
      text: newContent
    }: { message: HavocMessage; fn: string; text: string }
  ) {
    message.guild!.tags.delete(name);
    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id },
      { populate: ['tags'] }
    );
    if (!guild) return;

    await guild.tags.init();
    const tag = guild.tags.getItems().find(tag => tag.name === name)!;

    message.guild!.tags.set(name, newContent);
    tag.content = newContent;
    tag.updatedBy = message.author.id;

    await this.db.flush();

    message.respond(
      `I have edited the tag \`${name}\` which you can trigger by entering \`${message.prefix}${name}\``
    );
  }
}
