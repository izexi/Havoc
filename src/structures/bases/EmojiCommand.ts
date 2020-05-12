import Command from './Command';
import HavocMessage from '../extensions/HavocMessage';
import { Util } from 'discord.js';

export default class extends Command {
  constructor(emojiName: string) {
    super(`/emojis/${emojiName}.js`, {
      description: emojiName,
    });
  }

  async run({ message }: { message: HavocMessage }) {
    const requiredRole = 'HavocEmojis';
    const role =
      message.guild!.roles.cache.find((r) => r.name === requiredRole) ??
      (await message.guild!.roles.create({ data: { name: requiredRole } }));
    if (!message.member.roles.cache.has(role.id))
      return message.respond(
        `you need to have the \`${requiredRole}\` role in order to use this command.`
      );

    const emojiFile = `${message.command.name.toLowerCase()}.png`;
    await message.delete();
    message.channel.send(
      message
        .constructEmbed({
          attachFiles: [`src/assets/images/emojis/${emojiFile}`],
          setImage: `attachment://${emojiFile}`,
          setAuthor: [message.member.displayName, message.author.pfp],
          setFooter: message.text
            ? Util.cleanContent(message.text, message)
            : '',
        })
        // @ts-ignore
        .setTimestamp(null)
    );
  }
}
