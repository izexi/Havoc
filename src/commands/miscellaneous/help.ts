import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';
import Responses from '../../util/Responses';
import { Util as djsUtil } from 'discord.js';

export default class Help extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Shows a list of all avaiable commands, or detailed info about a specific command.',
			aliases: new Set(['h']),
			args: [{ type: 'command' }],
			examples: {
				'': 'responds with a list of all avaiable commands',
				'help': 'responds with detailed info about the "help" command'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { command } }: { msg: HavocMessage; target: { command: Command } }) {
		if (command && command.category !== 'dev') {
			const embed = msg.constructEmbed({
				setTitle: `Command info for  **\`${command.name}\`**\n⠀`,
				addField: [
					['❯Description', command.description, true],
					['❯Category', Util.captialise(command.category), true]
				],
				attachFiles: [`src/assets/images/${command.category}.png`],
				setThumbnail: `attachment://${command.category}.png`
			});
			if (command.aliases.size) {
				embed.addField('❯Aliases', [...command.aliases].map(alias => `\`${alias}\``).join(', '));
			}
			if (command.args || command.flags.size) {
				const format = (str: string, usage = false) => str
					.replace(/{prefix}/g, msg.prefix)
					.replace(/{([^}]+)}/g,
						(_, o): string => usage
							? Responses.usage(o)
							: djsUtil.cleanContent(Responses.random(msg, o).toString(), msg));
				// eslint-disable-next-line @typescript-eslint/promise-function-async
				embed.addField('❯Arguments', `${command.usage
					? command.usage.map(u => `•\`${format(u, true)}\``).join('\n')
					: `•${command.args!.map(arg => {
						const optional = arg.optional || !(command.opts & (1 << 3));
						const [s, e] = optional ? '<>' : '[]';
						const usage = Responses.usage(arg.type) || Responses.usage(arg.key);
						return `\`${s}${format(usage)}${e}\``;
					}).join(' ')}`}
				(\`[]\` = required, \`<>\` = optional, \`|\` = or)`);
				// @ts-ignore
				const examples = Object.entries(command.examples) as [string, string][];
				if (examples.length) {
					embed.addField('❯Examples',
						examples.map(([example, desc]) =>
							`•\`${msg.prefix}${command.name} ${format(example)}\` => ${desc}`).join('\n'));
				}
			}
			return msg.response = await msg.sendEmbed(embed);
		}
		const emojis: { [key: string]: string } = {
			emojis: '<:emojis:466978216339570701>',
			fun: '<:fun:407988457772810241>',
			miscellaneous: '<:miscellaneous:404688801903017984>',
			moderation: '<:moderation:407990341157912587>',
			server: '🛠',
			donators: '💸',
			music: '🎶',
			image: '🖼'
		};
		const commands = this.commands.filter(c => c.category !== 'dev' && !c.name.includes('-'));
		const categories: Set<string> = commands.reduce((uniqueCategories, { category }) => uniqueCategories.add(category), new Set());
		const fields = [...categories].reduce((arr: string[][], commandCategory) => {
			arr.push([
				`${emojis[commandCategory]} ${Util.captialise(commandCategory)}`,
				`${commands
					.filter(({ category }) => category === commandCategory)
					.map(c => `\`${c.name.replace('_', '')}\``).join(', ')}
					⠀`
			]);
			return arr;
		}, []);
		msg.response = await msg.sendEmbed({
			setDescription:
				`You can view more info about a command by doing \`${msg.prefix}help [command name]\`
				Click **[here](https://discord.gg/3Fewsxq)** to join the support server here
				Click **[here](https://discordapp.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot&permissions=2146958591)** to invite me to your server
				Click **[here](https://www.patreon.com/user?u=15028160)** to support me by donating
				⠀`,
			addField: fields
		});
	}
}
