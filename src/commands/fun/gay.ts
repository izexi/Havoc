import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';
import Logger from '../../util/Logger';
import Util from '../../util/Util';

const emoji = (percentage: number) => {
	if (percentage >= 75) return '<:gay:410129441755496448>';
	if (percentage >= 50) return '🏳️‍🌈';
	if (percentage >= 25) return '🌈';
	return percentage ? '<:kappapride:462323575375003658>' : '📏';
};

export default class Gay extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0000,
			description: 'A 100% accurate gayness calculator.',
			args: [{ type: 'user' }]
		});
	}

	public async run(this: HavocClient, { msg, target: { user } }: { msg: HavocMessage; target: { user: HavocUser } }) {
		this.db.category = 'gay';
		this.db.get(user.id).then(async res => {
			if (!res) {
				res = Util.randomInt(0, 100);
				await this.db.set(user.id, res);
			}
			msg.sendEmbed({ setDescription: `**${msg.author.tag}** I can tell you for sure that, ${user.id === msg.author.id ? 'you' : `**${user.tag}** is`} **${res}% gay** ${emoji(res)}.` });
		}).catch(err => Logger.error('Database error for dick', err));
	}
}
