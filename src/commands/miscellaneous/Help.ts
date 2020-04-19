import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Shows a list of all avaiable commands, or detailed info about a specific command.',
      aliases: ['h'],
      args: {
        type: message => {
          const possibleCmd = message.arg?.toLowerCase();
          if (!possibleCmd) return;
          const commands = message.client.commandHandler.holds;
          return (
            commands.get(possibleCmd) ||
            [...commands.values()].find(command =>
              command.aliases.has(possibleCmd)
            )
          );
        }
      }
    });
  }

  async run({
    message,
    fn: command
  }: {
    message: HavocMessage;
    fn: Command | undefined;
  }) {
    if (command && command.category !== 'dev') {
      const embed = {
        setTitle: `Command info for  **\`${command.name}\`**\n⠀`,
        addFields: [
          { name: '❯Description', value: command.description, inline: true },
          {
            name: '❯Category',
            value: Util.captialise(command.category),
            inline: false
          }
        ],
        attachFiles: [`src/assets/images/${command.category}.png`],
        setThumbnail: `attachment://${command.category}.png`
      };
      if (command.aliases.size) {
        embed.addFields.push({
          name: '❯Aliases',
          value: [...command.aliases].map(alias => `\`${alias}\``).join(', '),
          inline: true
        });
      }
      // TODO: Add examples
      if (command.args) {
        embed.addFields.push({
          name: '❯Arguments',
          value: command.args.map(arg => arg.type).join(', '),
          inline: true
        });
      }
      if (command.flags.length) {
        embed.addFields.push({
          name: '❯Aliases',
          value: command.flags.map(flag => `\`${flag}\``).join(', '),
          inline: true
        });
      }
      return message.respond(embed);
    }

    const emojis: { [key: string]: string } = {
      emojis: '<:emojis:466978216339570701>',
      fun: '<:fun:407988457772810241>',
      miscellaneous: '<:miscellaneous:404688801903017984>',
      moderation: '<:moderation:407990341157912587>',
      server: '🛠',
      donators: '💸',
      music: '🎶',
      image: '🖼'
    };
    message.respond({
      setDescription: `You can view more info about a command by doing \`${message.prefix}help [command name]\`
				Click **[here](https://discord.gg/3Fewsxq)** to join the support server here
				Click **[here](https://discordapp.com/oauth2/authorize?client_id=${message.client.user?.id}&scope=bot&permissions=2146958591)** to invite me to your server
				Click **[here](https://www.patreon.com/user?u=15028160)** to support me by donating
				⠀`,
      addFields: [...message.client.commandHandler.holds.values()]
        .filter(command => command.category !== 'dev' && !command.sub)
        .reduce(
          (
            fields: { name: string; value: string }[],
            { category, name: cmdName }
          ) => {
            const formattedCatgory = `${emojis[category]} ${Util.captialise(
              category
            )}`;
            const formattedName = `\`${cmdName}\``;
            const existing = fields.find(
              ({ name }) => name === formattedCatgory
            );
            if (existing) existing.value += `, ${formattedName}`;
            else fields.push({ name: formattedCatgory, value: formattedName });
            return fields;
          },
          []
        )
    });
  }
}
