import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';

export default class Avatar extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View the current prefix.',
			aliases: new Set(['warnplist', 'punishmentlist'])
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		let { punishments }: { punishments: { [key: number]: string } } = await msg.guild.config;
		if (!punishments) {
			punishments = {
				3: 'mute 30',
				5: 'kick',
				10: 'ban'
			};
		}
		msg.sendEmbed({
			setDescription: Util.codeblock(
				Object.entries(punishments)
					.map(([amount, punishment]) => `${amount} => ${punishment[0] === 'm' ? `Mute for ${punishment.match(/\d+/)![0]} minutes` : Util.captialise(punishment)}\n`)
					.join('\n')
			)
		});
	}
}
