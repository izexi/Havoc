import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';

export default class Catfish extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Returns a Google reverse image search of someone\'s avatar.',
			aliases: new Set(['cf']),
			args: [{
				type: 'user',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username whose avatar you would like to search.' }
			}],
			examples: { '@Havoc': 'responds with a Google image search of Havoc\'s avatar' }
		});
	}

	public async run(this: HavocClient, { msg, target: { user } }: { msg: HavocMessage; target: { user: HavocUser } }) {
		msg.respond({
			setDescription: `[Image search of ${user.tag}'s avatar](https://images.google.com/searchbyimage?image_url=${user.pfp})`,
			attachFiles: ['src/assets/images/catfish.png'],
			setThumbnail: 'attachment://catfish.png',
			setURL: `https://images.google.com/searchbyimage?image_url=${user.pfp}`
		});
	}
}