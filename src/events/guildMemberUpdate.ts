import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildMember } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';
import Util from '../util/Util';

export default async function(this: HavocClient, outdated: GuildMember, updated: GuildMember) {
	const guild = updated.guild as HavocGuild;
	if (guild.disabledLogs.has(12)) return;
	if (outdated.displayName !== updated.displayName) {
		const entry = await Log.getEntry(guild, 'MEMBER_UPDATE');
		const executor = await Log.getExecutor(updated, 'MEMBER_UPDATE', entry);
		Log.send(updated.guild as HavocGuild,
			new MessageEmbed()
				.setDescription(`
					${executor ? `**✏Changed By :**  ${executor}` : ''}
					${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
					**⤴Old nickname :**  ${outdated.displayName}
					**⤵New nickname :**  ${updated.displayName}
					**🔎Member :**  ${updated}
				`)
				.setColor('ORANGE')
				.setAuthor(`${updated.user.tag}'s nickname was changed`, (updated.guild as HavocGuild).iconURL())
				.setFooter(`User ID: ${updated.id}`)
				.setTimestamp());
	}
	if (outdated.roles.size !== updated.roles.size) {
		const entry = await Log.getEntry(guild, 'MEMBER_ROLE_UPDATE');
		const executor = await Log.getExecutor(updated, 'MEMBER_ROLE_UPDATE', entry);
		let role;
		let perms = '';
		if (outdated.permissions.has(8) && updated.permissions.has(8)) {
			perms = `\**📝Permissions ${outdated.roles.size < updated.roles.size ? 'gained' : 'lost'} :**
					Member still has **\`Administrator\`** permissions, so they still have all other permissions`;
		}
		if (outdated.roles.size < updated.roles.size) {
			role = updated.roles.find(({ id }) => !outdated.roles.has(id));
			if (!outdated.permissions.has(8) && updated.permissions.has(8)) {
				perms = `**📝Permissions gained :**
						**\`Administrator\`** permission granted, which grants the member to all other permissions.`;
			} else if (outdated.permissions.missing(updated.permissions).length) {
				/* eslint-disable newline-per-chained-call */
				perms = `**📝Permissions gained :**
						${outdated.permissions.missing(updated.permissions).sort().map(perm => `\`${Util.normalizePermFlag(perm)}\``).join('\n')}`;
			}
		}
		if (outdated.roles.size > updated.roles.size) {
			role = outdated.roles.find(({ id }) => !updated.roles.has(id));
			if (updated.permissions.missing(outdated.permissions).length) {
				perms = `**📝Permissions lost :**
						${updated.permissions.missing(outdated.permissions).sort().map(perm => `\`${Util.normalizePermFlag(perm)}\``).join('\n')}`;
			}
		}
		Log.send(updated.guild as HavocGuild,
			new MessageEmbed()
				.setDescription(`
					${executor ? `**✏${outdated.roles.size < updated.roles.size ? 'Added' : 'Removed'} By :**  ${executor}` : ''}
					${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
					**${outdated.roles.size < updated.roles.size ? '➕Role added' : '➖Role removed'} :**  ${role}
					**🔎Member :**  ${updated}
					${perms}
				`)
				.setColor(outdated.roles.size < updated.roles.size ? 'GREEN' : 'RED')
				.setAuthor(`Role was ${outdated.roles.size < updated.roles.size ? 'added to' : 'removed from'} ${updated.user.tag}`, (updated.guild as HavocGuild).iconURL())
				.setFooter(`Member ID: ${updated.id}`)
				.setTimestamp());
	}
}
