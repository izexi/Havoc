import Command, { Status } from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { SnowflakeUtil } from 'discord.js';
import { NOOP, EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Creates a suggestion that will either be approved or denied.',
      aliases: ['s', 'suggest'],
      args: {
        required: true,
        example: ['delete this server', 'deny'],
        name: 'suggestion | sub command (approve | deny | config)',
        type: (message) => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (['approve', 'deny', 'config'].includes(possibleSubCmd)) {
            message.args.shift();
            message.command = message.client.commandHandler.find(
              `suggestion-${possibleSubCmd}`
            )!;
            message.runCommand();
            return Status.SUBCOMMAND;
          }
          return message.text || null;
        },
        prompt: (message) =>
          `enter the suggestion that you would like to create${
            message.member?.permissions.has('MANAGE_GUILD')
              ? 'or enter whether you will like to `approve`, `deny` or `config` the suggestion by entering the according option'
              : ''
          }.`,
      },
    });
  }

  async run({
    message,
    fn: suggestion,
  }: {
    message: HavocMessage;
    fn: string;
  }) {
    if (!suggestion) return;
    const suggestionChannel = await message.findConfigChannel('suggestion');
    if (!suggestionChannel) return;

    await message.delete();
    const suggestionMessage = (await suggestionChannel.send(
      message.constructEmbed({
        addFields: [
          { name: 'Suggestion:', value: suggestion },
          { name: 'Status:', value: 'Open' },
        ],
        setAuthor: [
          `${EMOJIS.SUGGESTION}Suggestion from ${message.author.tag} (${message.author.id})${EMOJIS.SUGGESTION}`,
          message.author.pfp,
        ],
        setColor: 'YELLOW',
        setFooter: `Suggestion ID: ${SnowflakeUtil.generate(new Date())}`,
      })
    )) as HavocMessage;
    if (!suggestionMessage) return;

    await Promise.all([
      suggestionMessage
        .edit(
          suggestionMessage?.embeds[0].setFooter(
            `Suggestion ID: ${suggestionMessage.id}`
          )
        )
        .catch(NOOP),
      suggestionMessage.safeReact(EMOJIS.TICK),
      suggestionMessage.safeReact(EMOJIS.CROSS),
    ]);

    const embed = message.constructEmbed({
      setAuthor: `${EMOJIS.SUGGESTION}Your suggestion in ${
        message.guild!.name
      } has been submitted${EMOJIS.SUGGESTION}`,
      addFields: [
        { name: 'Suggestion:', value: suggestion },
        { name: 'Status:', value: 'Open' },
      ],
      setDescription: `\n\nClick [here](${suggestionMessage.url}) to view it.\nYou will be notified about the status of approval/denial.`,
      setFooter: `Suggestion ID: ${suggestionMessage.id}`,
      setColor: 'YELLOW',
    });

    await message.author.send(embed).catch(() => {
      message.respond(`your suggestion has been submitted, click [here](${suggestionMessage.url}) to view it.
			I was unable to DM you so you will need to enable them if you will be notified about the status of approval/denial.`);
    });
  }
}
