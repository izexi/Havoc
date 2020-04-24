import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Delete a tag from the server.',
      args: {
        name: 'name',
        example: ['name', 'a name with spaces'],
        type: message => {
          let possibleName = message.text;
          if (message.guild!.tags.has(possibleName))
            return message.shiftArg(possibleName);
        },
        required: true,
        promptOpts: {
          initial:
            'enter the name of the tag you would like to delete, e.g: `name` or `"a name"`',
          invalid: "I couldn't find a tag with that name"
        }
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    { message, fn: name }: { message: HavocMessage; fn: string }
  ) {
    message.guild!.tags.delete(name);
    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id },
      { populate: ['tags'] }
    );
    if (!guild) return;

    const tag = guild.tags.getItems().find(tag => tag.name === name)!;
    await guild.tags.init();
    guild.tags.remove(tag);
    await this.db.flush();

    message.respond(`I have deleted the \`${name}\` tag which was created by \`${
      (await this.users.fetch(tag.createdBy)).tag
    }\` on \`${new Date(
      tag.createdAt
    ).toLocaleString()} (UTC)\` that had the content ${
      tag.updatedBy
        ? `(last modified by \`${
            (await this.users.fetch(tag.updatedBy)).tag
          }\` on \`${new Date(tag.updatedAt).toLocaleString()})\``
        : ''
    }:
				${Util.codeblock(tag.content)}`);
  }
}
