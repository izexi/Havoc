import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { inspect } from 'util';
import Util from '../../util/Util';

export default class Eval extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Evals shit.',
			aliases: new Set(['ev']),
			flags: new Set(['silent', 'detailed']),
			target: 'string',
			prompt: {
				initialMsg: ['enter the code that you would like to eval.']
			}
		});
	}

	public async run(this: HavocClient, { msg, flag, targetObj: { target } }: { msg: HavocMessage; flag: string; targetObj: { target: string } }) {
		const start = process.hrtime();
		const code = target;
		try {
			// eslint-disable-next-line no-eval
			let result = eval(code);
			if (result instanceof Promise) result = await result;
			const end = process.hrtime(start);
			const type = typeof result === 'object' ? result.constructor.name : typeof result;
			result = inspect(result, {
				depth: 0,
				maxArrayLength: flag === 'detailed' ? Infinity : 100
			}).replace(new RegExp(this.token!, 'g'), 'no');
			msg.response = await msg.sendEmbed({
				setDescription: `**📥 Input**\n${Util.codeblock(msg.text, 'js')}\n**📤 Output**\n${Util.codeblock(result, 'js')}\n**❔ Type:** \`${type}\``,
				setFooter: [`executed in ${end[0] + (end[1] / 1000000)} milliseconds`, msg.author.pfp]
			});
		} catch (error) {
			const end = process.hrtime(start);
			error = inspect(error, {
				depth: 0,
				maxArrayLength: 0
			});
			msg.response = await msg.sendEmbed({
				setDescription: `**📥 Input**\n${Util.codeblock(msg.text, 'js')}\n**❗ Error:**\n${Util.codeblock(error)}`,
				setFooter: [`executed in ${end[0] + (end[1] / 1000000)} milliseconds`, msg.author.pfp]
			});
		}
	}
}
