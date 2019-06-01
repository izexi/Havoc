import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';
import Logger from '../../util/Logger';
import Util from '../../util/Util';

const size = () => {
	const rand = Math.random();
	if (rand < 0.65) return Util.randomInt(1, 5);
	else if (rand < 0.85) return Util.randomInt(6, 15);
	else if (rand < 0.95) return Util.randomInt(16, 20);
	return Util.randomInt(21, 25);
};

export default class Dick extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0000,
			description: 'A 100% accurate dick size calculator.',
			aliases: new Set(['d', 'penis']),
			target: 'user'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: HavocUser } }) {
		const user = target || msg.author;
		this.db.category = 'dick';
		this.db.get(user.id).then(async res => {
			if (!res) {
				res = size();
				await this.db.set(user.id, res);
			}
			msg.sendEmbed({
				setDescription: `**${msg.author.tag}** ${user.id === msg.author.id ? 'after taking a measurement I can confirm that: You sir, have' : `according to my calculations, **${user.tag}** has`} a **${res} incher**.`,
				setFooter: `8${'='.repeat(res * 2)}D`
			});
		}).catch(err => Logger.error('Database error for dick', err));
	}
}
