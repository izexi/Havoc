import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import fetch from 'node-fetch';
import Util from '../../util/Util';

export default class Json extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View a pretty printed JSON that is parsed from the entered URL.',
			prompt: {
				initialMsg: ['enter the URL.'],
				validateFn: (msg: HavocMessage, str: string): boolean => {
					try {
						new URL(str);
						return true;
					} catch (error) {
						return false;
					}
				},
				invalidResponseMsg: 'You need to enter a valid absolute URL.'
			},
			target: 'string'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: string } }) {
		const description = fetch(target)
			.then(async res => {
				if (!res.headers.get('content-type')!.includes('application/json')) {
					return `**${msg.author.tag}** I couldn't find any JSON to parse on \`${msg.text}\`.`;
				}
				const json = JSON.stringify((await res.json()), null, 2);
				return Util[json.length > 2036 ? 'haste' : 'codeblock'](json, 'json');
			})
			.catch(err => `**${msg.author.tag}** I ran into an error while trying to access \`${msg.text}\` \n\`${err}\``);
		msg.response = await msg.sendEmbed({
			setDescription: (await description)
		});
	}
}
