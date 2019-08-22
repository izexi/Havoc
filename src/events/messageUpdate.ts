import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';
import HavocMessage from '../extensions/Message';
import Util from '../util/Util';

export default async function(this: HavocClient, outdated: HavocMessage, updated: HavocMessage) {
	const guild = updated.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(14) || updated.content === outdated.content || outdated.author.bot) return;
	updated.args = updated.content.split(/ +/);
	const command = this.commands.handler.get(updated.args.shift()!.substring(updated.prefix.length));
	if (command) {
		return this.commands.handler.handle(updated, command).catch(console.error);
	}
	const embed = new MessageEmbed()
		.setDescription(`
			${outdated.content.length < 900 ? `**📝Before  :** ${Util.codeblock(outdated.content)}` : ''}
			${updated.content.length < 900 ? `**✏After :** ${Util.codeblock(updated.content)}` : ''}
			**📅Timestamp of message :**  ${outdated.createdAt.toLocaleString()} (UTC)
			**📂Channel :**  ${updated.channel}
			**✍Message author :**  ${updated.author}
		`)
		.setColor('RED')
		.setAuthor(`${updated.author.tag}'s message was edited`, updated.author.pfp)
		.setFooter(`Message ID: ${updated.id}`)
		.setTimestamp();
	let txt = '';
	if (outdated.content.length >= 900) txt += `BEFORE:\r\n${outdated.content}`;
	if (updated.content.length >= 900) txt += `\nAFTER:\r\n${updated.content}`;
	if (outdated.content.length >= 900 || updated.content.length >= 900) {
		embed.attachFiles([{
			attachment: Buffer.from(txt, 'utf8'),
			name: 'edited_content.txt'
		}]);
	}
	Log.send(guild, embed);
}
