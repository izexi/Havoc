import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Avatar extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View the current prefix.',
			aliases: new Set(['warnp', 'punishments']),
			args: [{
				type: 'number',
				prompt: {
					initialMsg: 'enter the amount of warnings that must be reached for this punishment',
					invalidResponseMsg: 'you need to enter the number of warnings, e.g: `3`'
				}
			}, {
				key: 'punishment',
				type: (msg: HavocMessage) => {
					if (msg.arg === 'none' || msg.arg === 'kick' || msg.arg === 'ban') return msg.arg;
					if (msg.arg === 'mute' && Number(msg.args[1])) return msg.text;
				},
				prompt: {
					initialMsg: 'enter the punishment, which can be either `None`, mute [minutes]`, `kick` or `ban`',
					invalidResponseMsg: 'you need to enter `mute 30` for example or `kick` or `ban` as the punishment'
				}
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { number, punishment } }: { msg: HavocMessage; target: { number: number; punishment: string } }) {
		let { punishments }: { punishments: { [key: number]: string } } = await msg.guild.config;
		if (!punishments) {
			punishments = {
				3: 'mute 30',
				5: 'kick',
				10: 'ban'
			};
		}
		if (punishment === 'none') {
			delete punishments[number];
		} else {
			const existing = Object.entries(punishments).find(([, p]) => p[0] === punishment[0]);
			if (existing) delete punishments[Number(existing[0])];
			punishments[number] = punishment;
		}
		await msg.guild.addConfig({ punishments });
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have updated this server's warn punishments to, you can view them by doing \`${msg.prefix}warnpunishlist\`.` });
	}
}
