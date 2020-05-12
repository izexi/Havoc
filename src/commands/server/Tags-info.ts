import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import TagEntity from '../../structures/entities/TagEntity';
import { PROMPT_ENTER } from '../../util/CONSTANTS';

export async function tagFields(tag: TagEntity, client: Havoc) {
  const fields = [
    { name: '❯Name', value: `\`${tag.name}\`` },
    { name: '❯Content', value: Util.codeblock(tag.content) },
    {
      name: '❯Created by',
      value: (await client.users.fetch(tag.createdBy)).tag,
    },
    {
      name: '❯Created at',
      value: `${new Date(tag.createdAt).toLocaleString()} (UTC)`,
    },
  ];
  if (tag.updatedBy) {
    fields.push({
      name: '❯Last modified by',
      value: (await client.users.fetch(tag.updatedBy)).tag,
    });
    fields.push({
      name: '❯Last modified at',
      value: `${new Date(tag.updatedAt).toLocaleString()} (UTC)`,
    });
  }
  return fields;
}

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View info about a tag from the server.',
      args: {
        name: 'name',
        example: ['name', 'a name with spaces'],
        type: (message) => {
          let possibleName = message.text;
          if (message.guild!.tags.has(possibleName))
            return message.shiftArg(possibleName);
        },
        required: true,
        promptOpts: {
          initial: PROMPT_ENTER(
            'the name of the tag you would like to view info about, e.g: `name` or `a name`'
          ),
          invalid: "I couldn't find a tag with that name",
        },
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run(
    this: Havoc,
    { message, fn: name }: { message: HavocMessage; fn: string }
  ) {
    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id },
      { populate: ['tags'] }
    );
    if (!guild) return;

    await guild.tags.init();
    const tag = guild.tags.getItems().find((tag) => tag.name === name)!;

    message.respond({
      addFields: await tagFields(tag, this),
      setThumbnail: await this.users
        .fetch(tag.createdBy)
        .then((user) => user.displayAvatarURL()),
    });
  }
}
