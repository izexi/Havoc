import Command, { Status } from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import GuildEntity from '../../structures/entities/GuildEntity';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';
import { SnowflakeUtil } from 'discord.js';

export async function getSuggestionChannel(message: HavocMessage) {
  const guild = message.guild!;
  const existing = guild.channels.cache.find(
    channel => channel.name === 'suggestions'
  );
  const guildEntity = await message.client.db.find(GuildEntity, guild.id);
  const setupResponse = `${
    message.member!.permissions.has('MANAGE_GUILD')
      ? 'U'
      : 'You will need to ask someone with the `Manage Guild` permission to u'
  }se \`${message.prefix}suggestion config\` to set one up.`;

  if (!guildEntity || !guildEntity.suggestion) {
    if (!existing) {
      message.respond({
        setDescription: `**${message.author.tag}** I couldn't find a \`#suggestions\` and a suggestion channel hasn't been configured. ${setupResponse}`
      });
      return null;
    }
    return existing;
  }

  const channel = guildEntity.suggestion;
  const suggestionChannel = guild.channels.cache.get(channel);
  if (!suggestionChannel) {
    message.respond({
      setDescription: `**${message.author.tag}** the suggestion channel that was in the configuration doesn't exist. ${setupResponse}.`
    });
    delete guildEntity.suggestion;
    await message.client.db.flush();
    return null;
  }
  return suggestionChannel;
}

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Creates a suggestion that will either be approved or denied.',
      aliases: ['s', 'suggest'],
      args: {
        required: true,
        type: message => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (['approve', 'deny', 'config'].includes(possibleSubCmd)) {
            message.command = message.client.commandHandler.commands.get(
              `suggestion-${possibleSubCmd}`
            )!;
            message.runCommand();
            return Status.SUBCOMMAND;
          }
          return message.text || null;
        },
        prompt: message =>
          `enter the suggestion that you would like to create${
            message.member?.permissions.has('MANAGE_GUILD')
              ? 'or enter whether you will like to `approve`, `deny` or `config` the suggestion by entering the according option'
              : ''
          }.`
      }
    });
  }

  async run({
    message,
    fn: suggestion
  }: {
    message: HavocMessage;
    fn: string;
  }) {
    if (!suggestion) return;
    const suggestionChannel = (await getSuggestionChannel(
      message
    )) as HavocTextChannel;
    if (!suggestionChannel) return;

    await message.delete();
    const suggestionMessage = await suggestionChannel.send(
      message.constructEmbed({
        addFields: [
          { name: 'Suggestion:', value: suggestion },
          { name: 'Status:', value: 'Open' }
        ],
        setAuthor: [
          `💡Suggestion from ${message.author.tag} (${message.author.id})💡`,
          message.author.pfp
        ],
        setColor: 'YELLOW',
        setFooter: `Suggestion ID: ${SnowflakeUtil.generate(new Date())}`
      })
    );
    if (!suggestionMessage) return;

    await Promise.all([
      suggestionMessage.edit(
        suggestionMessage?.embeds[0].setFooter(
          `Suggestion ID: ${suggestionMessage.id}`
        )
      ),
      suggestionMessage.react('416985886509498369'),
      suggestionMessage.react('416985887616925726')
    ]);

    const embed = message.constructEmbed({
      setAuthor: `💡Your suggestion in ${
        message.guild!.name
      } has been submitted💡`,
      addFields: [
        { name: 'Suggestion:', value: suggestion },
        { name: 'Status:', value: 'Open' }
      ],
      setDescription: `\n\nClick [here](${suggestionMessage.url}) to view it.\nYou will be notified about the status of approval/denial.`,
      setFooter: `Suggestion ID: ${suggestionMessage.id}`,
      setColor: 'YELLOW'
    });

    await message.author.send(embed).catch(() => {
      message.respond(`your suggestion has been submitted, click [here](${suggestionMessage.url}) to view it.
			I was unable to DM you so you will need to enable them if you will be notified about the status of approval/denial.`);
    });
  }
}
