import { promisify } from 'util';
import Store from '../structures/bases/Store';
import Logger from '../util/Logger';
import Command from '../structures/bases/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Client, Util } from 'discord.js';
import HavocMessage from '../extensions/Message';
import HavocClient from '../client/Havoc';
const readdir = promisify(require('fs').readdir);

export default class CommandStore extends Store<string, Command> {
	private _client: Client;

	public handler: CommandHandler;

	public constructor(client: Client) {
		super();
		this._client = client;
		this.handler = new CommandHandler(this._client, this);
	}

	protected async _load(): Promise<void> {
		const commandFiles = (await readdir('src/commands')).reduce(async (files: Set<string>, dirs: string) => {
			files = await files;
			(await readdir(`src/commands/${dirs}`))
				.map((fileName: string): Set<string> => files.add(`../commands/${dirs}/${fileName.slice(0, -3)}`));
			return files;
		}, Promise.resolve(new Set()));

		for (const commandFile of await commandFiles) {
			try {
				const command = new (require(commandFile).default)();
				this.handler.add(command.name, command);
			} catch (err) {
				Logger.error(`Error while importing file - ${commandFile}`, err);
			}
		}
		await this.addEmojiCommands();
		Logger.info(`Loaded ${this.size} commands.`);
	}

	private async addEmojiCommands() {
		const emojis = await readdir('src/assets/images/emojis');
		const aliases: { [key: string]: string } = {
			ahahaa: 'acringe',
			ahahaaslide: 'ahahaaslide',
			angery: 'angeryboye',
			athonking: 'athonk',
			awesmart: 'asmart',
			ayaya: 'weeb',
			ayoutried: 'autried',
			banned: 'b&',
			blobstop: 'stop',
			blobsweats: 'sweat',
			dcolon: 'd:',
			facepalm: 'fp',
			feelsbadman: 'pepesad',
			hahaa: 'cringe',
			pepelaugh: 'feelsfunnyman',
			thonking: 'thonk',
			veriangery: 'rage',
			youtried: 'utried'
		};
		for (const emoji of emojis) {
			const [name, ext] = emoji.split('.');
			class Emoji extends Command {
				public constructor() {
					super(`\\${ext === 'gif' ? 'donators' : 'emojis'}\\${name}.ts`, {
						opts: 0b0011,
						description: name,
						aliases: aliases[name] ? new Set([aliases[name]]) : new Set(),
						userPerms: {
							role: async (msg: HavocMessage) => {
								if (msg.command.category === 'donators') return msg.guild.id;
								let role = msg.guild.roles.find(r => r.name === 'HavocEmojis');
								if (!role) role = await msg.guild.roles.create({ data: { name: 'HavocEmojis' } });
								return role.id;
							}
						}
					});
				}

				public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
					msg.delete();
					const embed = msg.constructEmbed({
						attachFiles: [`src/assets/images/emojis/${emoji}`],
						setImage: `attachment://${emoji}`,
						setAuthor: [msg.member!.displayName, msg.author.pfp]
						// @ts-ignore
					}).setTimestamp(null);
					// @ts-ignore
					msg.respond(embed.setFooter(msg.text ? Util.cleanContent(msg.text, msg) : '', null));
				}
			}
			const command = new Emoji();
			this.handler.add(command.name, command);
		}
	}
}
