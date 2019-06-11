import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';
import { inspect } from 'util';

export default class Eval extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Evals shit.',
			aliases: new Set(['ev']),
			flags: new Set(['silent', 'detailed']),
			args: [{
				type: 'string',
				prompt: { initialMsg: 'enter the code that you would like to evaluate.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, flag, targetObj: { target } }: { msg: HavocMessage; flag: string; targetObj: { target: string } }) {
		const start = process.hrtime();
		const code = target;
		try {
			// eslint-disable-next-line no-eval
			let evaled = eval(code);
			if (evaled instanceof Promise) evaled = await evaled;
			const end = process.hrtime(start);
			const type = typeof evaled === 'object' ? evaled.constructor.name : typeof evaled;
			const output = inspect(evaled, {
				depth: 0,
				maxArrayLength: flag === 'detailed' ? Infinity : 100
			}).replace(new RegExp(this.token!, 'g'), 'no');
			if (flag !== 'silent') {
				msg.response = await msg.sendEmbed({
					setDescription: `**📥 Input**\n${Util.codeblock(msg.text, 'js')}\n**📤 Output**\n${Util.codeblock(output, 'js')}\n${flag === 'detailed' ? `🔎 **Detailed output** ${await Util.haste(inspect(evaled, { depth: Infinity }), 'js')}\n\n` : ''}**❔ Type:** \`${type}\``,
					setFooter: [`executed in ${end[0] + (end[1] / 1000000)} milliseconds`, msg.author.pfp]
				});
			}
		} catch (error) {
			const end = process.hrtime(start);
			error = inspect(error, {
				depth: 0,
				maxArrayLength: 0
			});
			if (flag !== 'silent') {
				msg.response = await msg.sendEmbed({
					setDescription: `**📥 Input**\n${Util.codeblock(msg.text, 'js')}\n**❗ Error:**\n${Util.codeblock(error)}`,
					setFooter: [`executed in ${end[0] + (end[1] / 1000000)} milliseconds`, msg.author.pfp]
				});
			}
		}
	}
}
