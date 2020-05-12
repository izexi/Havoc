import HavocMessage from '../structures/extensions/HavocMessage';
import { Collection } from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function (
  messages: Collection<HavocMessage['id'], HavocMessage>
) {
  const guild = messages.first()?.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(13)) return;

  guild.sendLog({
    addFields: [
      {
        name: '** 🗑Amount Deleted :**',
        value: messages.size.toString(),
      },
      {
        name: '**📂 Channel :**',
        value: messages.first()!.channel.toString(),
      },
    ],
    setColor: 'RED',
    setAuthor: [
      `Messages were bulk deleted in channel ${messages.first()!.channel}`,
      guild.iconURL(),
    ],
    attachFiles: [
      {
        attachment: Buffer.from(
          messages
            .map(
              (msg) =>
                `[${new Date(msg.createdTimestamp).toLocaleString()} (UTC)] ${
                  msg.author.tag
                } (${msg.author.id}): ${msg.content}
                ${
                  msg.attachments.first()
                    ? msg.attachments.first()!.proxyURL
                    : ''
                }`
            )
            .reverse()
            .join('\r\n'),
          'utf8'
        ),
        name: 'deleted_contents.txt',
      },
    ],
  });
}
