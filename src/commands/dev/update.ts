import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { promisify } from 'util';
import Util from '../../util/Util';
const exec = promisify(require('child_process').exec);

export default class Reload extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Restart me.'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const message = await msg.respond('<a:Restarting:411680219636826112> Updating...', false);
		const { stdout, stderr } = await exec('git pull');
		const description = `**stdout**:\n${Util.codeblock(stdout)}
		${stderr ? `**stderr**:\n${Util.codeblock(stderr)}` : ''}`;
		if (description.length >= 2048) {
			await message.delete();
			return message.channel.send({
				attachment: Buffer.from(description, 'utf8'),
				name: 'update.txt'
			});
		}
		message.edit(message.embeds[0].setDescription(description));
	}
}
