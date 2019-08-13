import HavocClient from '../client/Havoc';
import { Role, MessageEmbed } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';
import Util from '../util/Util';

export default async function(this: HavocClient, outdated: Role, updated: Role) {
	const entry = await Log.getEntry(updated.guild, 'ROLE_UPDATE');
	const executor = await Log.getExecutor(updated, 'ROLE_UPDATE', entry);
	let embed;
	if (outdated.name !== updated.name) {
		embed = new MessageEmbed()
			.setDescription(`
				${executor ? `**🔧Updated By :**  ${executor}` : ''}
				${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
				**⤴Old role name :**  ${outdated.name}
				**⤵New role name :**  ${updated.name}
			`)
			.setAuthor(`Role ${outdated.name}'s name was changed`, (updated.guild as HavocGuild).iconURL());
	}
	if (outdated.permissions.bitfield !== updated.permissions.bitfield) {
		let perms = '';
		if (outdated.permissions.has(8) && updated.permissions.has(8)) {
			perms = `\**📝Permissions :**
					Member still has **\`Administrator\`** permissions, so they still have all other permissions`;
		} else if (!outdated.permissions.has(8) && updated.permissions.has(8)) {
			perms = `**📝Permissions gained :**
					**\`Administrator\`** permission granted, which grants the member to all other permissions.`;
		} else if (outdated.permissions.missing(updated.permissions).length) {
			/* eslint-disable newline-per-chained-call */
			perms = `**📝Permissions gained :**
					${outdated.permissions.missing(updated.permissions).sort().map(perm => `\`${Util.normalizePermFlag(perm)}\``).join('\n')}`;
		} else if (updated.permissions.missing(outdated.permissions).length) {
			perms = `**📝Permissions lost :**
					${updated.permissions.missing(outdated.permissions).sort().map(perm => `\`${Util.normalizePermFlag(perm)}\``).join('\n')}`;
		}
		embed = new MessageEmbed()
			.setDescription(`
				${executor ? `**🔧Updated By :**  ${executor}` : ''}
				${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
				${perms}
			`)
			.setAuthor(`Role ${outdated.name}'s permissions were updated`, (updated.guild as HavocGuild).iconURL());
	}
	if (outdated.mentionable !== updated.mentionable) {
		embed = new MessageEmbed()
			.setDescription(`
				${executor ? `**${updated.mentionable ? '✅Enabled' : '❌Disabled'} By :**  ${executor}` : ''}
			`)
			.setColor(updated.mentionable ? 'GREEN' : 'RED')
			.setAuthor(`Role ${updated.name} is ${updated.mentionable ? 'now' : 'no longer'} mentionable`, (updated.guild as HavocGuild).iconURL());
	}
	if (outdated.hoist !== updated.hoist) {
		embed = new MessageEmbed()
			.setDescription(`
				${executor ? `**${updated.hoist ? '✅Enabled' : '❌Disabled'} By :**  ${executor}` : ''}
			`)
			.setColor(updated.hoist ? 'GREEN' : 'RED')
			.setAuthor(`Role ${updated.name} is ${updated.hoist ? 'now' : 'no longer'} hoisted`, (updated.guild as HavocGuild).iconURL());
	}
	if (outdated.color !== updated.color) {
		embed = new MessageEmbed()
			.setDescription(`
				${executor ? `**🔧Changed By :**  ${executor}` : ''}
				**📆Role created at :**  ${updated.createdAt.toLocaleString()} (UTC)
				**✏Old role color :**  ${outdated.hexColor === '#000000' ? 'Default colour' : outdated.hexColor}
				**🖌New role color :**  ${updated.hexColor === '#000000' ? 'Default colour' : updated.hexColor}
			`)
			.setAuthor(`Role ${outdated.name}'s colour was changed`, (updated.guild as HavocGuild).iconURL());
	}
	if (!embed) return;
	if (!embed.color) embed.setColor('ORANGE');
	Log.send(outdated.guild as HavocGuild, embed.setFooter(`Role ID: ${updated.id}`));
}
