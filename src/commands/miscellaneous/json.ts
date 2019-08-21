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
			args: [{
				key: 'url',
				type: (msg: HavocMessage) => {
					try {
						new URL(msg.arg);
						return msg.arg;
					} catch (error) {
						return false;
					}
				},
				prompt: {
					initialMsg: 'enter the URL.',
					invalidResponseMsg: 'You need to enter a valid absolute URL.'
				}
			}],
			usage: ['[url]'],
			examples: { 'https://jsonplaceholder.typicode.com/todos/1': `responds with${Util.codeblock(`{\n  "userId": 1,\n  "id": 1,\n  "title": "delectus aut autem",\n  "completed": false\n}`, 'json')}` }
		});
	}

	public async run(this: HavocClient, { msg, target: { url } }: { msg: HavocMessage; target: { url: string } }) {
		const json = await fetch(url)
			.then(async res => {
				if (!res.headers.get('content-type')!.includes('application/json')) {
					return `**${msg.author.tag}** I couldn't find any JSON to parse on \`${msg.text}\`.`;
				}
				return JSON.stringify((await res.json()), null, 2);
			})
			.catch(err => `**${msg.author.tag}** I ran into an error while trying to access \`${msg.text}\` \n\`${err}\``);
		msg.respond(await msg.sendEmbed({
			setDescription: Util[json.length > 2036 ? 'haste' : 'codeblock'](json, 'json')
		}, '', [{ attachment: Buffer.from(json, 'utf8'), name: 'attachment.json' }]));
	}
}
