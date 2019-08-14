import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';
import Util from '../util/Util';

export default async function(this: HavocClient, outdated: HavocGuild, updated: HavocGuild) {
	let executor = await Log.getExecutor({ guild: updated, id: updated.id }, 'GUILD_UPDATE');
	let condition;
	let prop = '';
	let arr;
	let before;
	let after;
	if (outdated.name !== updated.name) {
		prop = 'name';
	} else if (outdated.afkChannelID !== updated.afkChannelID) {
		condition = 'afkChannelID';
		prop = 'afkChannel.name';
	} else if (outdated.afkTimeout !== updated.afkTimeout) {
		prop = 'afkTimeout';
		before = Util.secondsToHM(outdated.afkTimeout);
		after = Util.secondsToHM(updated.afkTimeout);
	} else if (outdated.explicitContentFilter !== updated.explicitContentFilter) {
		prop = 'explicitContentFilter';
		arr = [
			'Don\'t scan any messages.',
			'Scan messages from members without a role.',
			'Scan messages sent by all members.'
		];
	} else if (outdated.verificationLevel !== updated.verificationLevel) {
		prop = 'verificationLevel';
		arr = [
			'None : Unrestricted',
			'Low : Must have a verified email on their Discord account.',
			'Medium : Must also be a member of this server for longer than 10 minutes.',
			'(╯°□°）╯︵ ┻━┻ : Must also be a member of this server for longer than 10 minutes.',
			'┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ : Must have a verified phone on their Discord account.'
		];
	} else if (outdated.icon !== updated.icon) {
		condition = 'icon';
	} else if (outdated.ownerID !== updated.ownerID) {
		executor = (await this.users.fetch(outdated.ownerID)).tag;
		before = executor;
		after = (await this.users.fetch(updated.ownerID)).tag;
	}
	if (!prop && !condition) return;
	const change = (prop || condition)!
		.split('.')[0].split(/(?=[A-Z])/)
		.map(word => Util.captialise(word))
		.join(' ');
	if (condition) {
		/* eslint-disable @typescript-eslint/promise-function-async */
		before = (outdated as { [key: string]: any })[condition]
			? prop.split('.').reduce((obj: { [key: string]: any }, option) => obj[option], outdated)
			: `No ${change} set.`;
		after = (updated as { [key: string]: any })[condition]
			? prop.split('.').reduce((obj: { [key: string]: any }, option) => obj[option], updated)
			: `No ${change} set.`;
	}
	if (arr) {
		before = arr[(outdated as { [key: string]: any })[prop]];
		after = arr[(outdated as { [key: string]: any })[prop]];
	}
	Log.send(updated,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🔧Updated By :**  ${executor}` : ''}
				**⤴Old ${change} :**  ${before || (outdated as { [key: string]: any })[prop]}
				**⤵New ${change} :**  ${after || (updated as { [key: string]: any })[prop]}
			`)
			.setColor('ORANGE')
			.setAuthor(`Server ${change} was changed`, (updated as HavocGuild).iconURL())
			.setFooter(`Server ID: ${updated.id}`)
			.setTimestamp());
}
