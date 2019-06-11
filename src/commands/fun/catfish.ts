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
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { user, loose } }: { msg: HavocMessage; target: { user: HavocUser; loose: string } }) {
		msg.response = await msg.sendEmbed({
			setDescription: `[Image search of ${loose ? user.tag.replace(new RegExp(loose, 'gi'), '**$&**') : user.tag}'s avatar](https://images.google.com/searchbyimage?image_url=${user.pfp})`,
			attachFiles: ['src/assets/images/catfish.png'],
			setThumbnail: 'attachment://catfish.png',
			setURL: `https://images.google.com/searchbyimage?image_url=${user.pfp}`
		});
	}
}
