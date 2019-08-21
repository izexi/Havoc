import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';
import HavocMessage from '../extensions/Message';
import Util from '../util/Util';
import HavocTextChannel from '../extensions/TextChannel';

export default async function(this: HavocClient, message: HavocMessage) {
	const guild = message.guild as HavocGuild;
	if (guild.disabledLogs.has(15) || message.author.bot || (message.channel as HavocTextChannel).prompts.has(message.author.id)) return;
	if (message.command && message.command.deleteable && message.response) message.response.delete();
	let executor;
	const entry = await Log.getEntry(message.guild, 'MESSAGE_DELETE');
	// @ts-ignore
	if (entry && entry.extra.channel.id === message.channel.id && (entry.target.id === message.author.id) && (entry.createdTimestamp > (Date.now() - 5000)) && (entry.extra.count >= 1)) {
		executor = entry.executor.tag;
	} else {
		executor = message.author.tag;
	}
	const embed = new MessageEmbed()
		.setDescription(`
			**🗑Deleted By :**  ${executor}
			**📅Timestamp of message :**  ${message.createdAt.toLocaleString()} (UTC)
			**📂Channel :**  ${message.channel}
			**✍Message author :**  ${message.author}
			${message.content && message.content.length < 1800 ? `**🗒Message content :** ${Util.codeblock(message.content)}` : ''}
		`)
		.setColor('RED')
		.setAuthor(`${message.author.tag}'s message was deleted`, message.author.pfp)
		.setFooter(`Message ID: ${message.id}`)
		.setTimestamp();
	if (message.attachments.size) {
		embed.attachFiles([{
			attachment: message.attachments.first()!.proxyURL,
			name: 'deleted.png'
		}]);
		embed.setImage('attachment://deleted.png');
	}
	if (message.content.length >= 1800) {
		embed.attachFiles([{
			attachment: Buffer.from(message.content, 'utf8'),
			name: 'deleted_content.txt'
		}]);
	}
	Log.send(guild, embed);
}
