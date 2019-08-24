import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Prompt from '../../structures/Prompt';

export default class Botclear extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View the heartbeat/latency in ms.',
			args: [{
				key: 'option',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['view', 'add', 'remove'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'what would you like to configure from prefixes that will be botcleared?\nEnter `view` / `add` / `remove`.',
					invalidResponseMsg: 'You will need to enter either `view` or `add` or `remove`.'
				}
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { option } }: { msg: HavocMessage; target: { option: string } }) {
		let { bcPrefixes }: { bcPrefixes: string[] } = await msg.guild.config;
		if (!bcPrefixes) bcPrefixes = [msg.prefix, '!', '.'];
		if (option === 'view') {
			return msg.respond(`current messages that are prefixed with ${bcPrefixes.map(prefix => `\`${prefix}\``).join(', ')} will be cleared when the botclear command is used.`);
		}
		let [prefix] = msg.args;
		if (!prefix) {
			await new Promise(resolve => {
				new Prompt({
					msg,
					initialMsg: `**${msg.author.tag}** enter the prefix that you would ${option} to the botclears.`,
					target: 'string'
				}).on('promptResponse', async ([responses]) => {
					prefix = (await responses).target;
					resolve();
				});
			});
		}
		if (option === 'add') {
			if (bcPrefixes.includes(prefix)) {
				return msg.respond(`\`${prefix}\` is already prefix that is being botcleared, you can view all the prefixes by entering \`${msg.prefix}bc config view\`.`);
			}
			bcPrefixes.push(prefix);
		} else {
			if (!bcPrefixes.includes(prefix)) {
				return msg.respond(`\`${prefix}\` isn't a prefix that is being botcleared, you can view all the prefixes by entering \`${msg.prefix}bc config view\`.`);
			}
			bcPrefixes.splice(bcPrefixes.indexOf(prefix), 1);
		}
		await msg.guild.addConfig({ bcPrefixes });
		msg.respond(`I have ${option}${option === 'add' ? 'e' : ''}d \`${prefix}\` to the list of prefixes that will be botcleared, you can view all the prefixes by entering \`${msg.prefix}bc config view\`.`);
	}
}
