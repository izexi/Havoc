import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Avatar extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View the current prefix.',
			args: [{
				key: 'prefix',
				type: 'string'
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { prefix } }: { msg: HavocMessage; target: { prefix: string } }) {
		if (!prefix) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** my current prefix for this server is \`${msg.prefix}\`.` });
		}
		if (prefix === msg.prefix) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** my current prefix for this server is already \`${msg.prefix}\`.` });
		}
		if (prefix === msg.defaultPrefix) {
			await msg.guild.removeConfig('prefix');
		} else {
			await msg.guild.addConfig({ prefix });
		}
		msg.guild.prefix = prefix;
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have updated this server's prefix to \`${prefix}\`.` });
	}
}
