import HavocMessage from '../extensions/Message';
import Util from '../util/Util';
import Logger from '../util/Logger';

export default class EmbedPagination {
	private msg: HavocMessage;

	private title: string;

	private descriptions: string[];

	private thumbnails?: string[];

	private maxPerPage: number;

	private page: number;

	private hastebin?: boolean;

	private embedMsg!: HavocMessage;

	private prepend!: string;

	private append!: string;

	public constructor(options: EmbedPaginationOptions) {
		this.msg = options.msg;
		this.title = options.title;
		this.descriptions = options.descriptions;
		this.maxPerPage = options.maxPerPage;
		this.page = (this.validatePageInt(options.page!) && options.page) || 1;
		this.hastebin = options.hastebin;
		this.thumbnails = options.thumbnails;
		this.prepend = options.prepend || '';
		this.append = options.append || '';
		this.setup();
	}

	private get totalPages() {
		return Math.ceil(this.descriptions.length / this.maxPerPage);
	}

	private validatePageInt(str: string | number) {
		return Number.isInteger(Number(str)) && str > 0 && str <= this.totalPages;
	}

	private pageEmbed(page: string | number, paginate: boolean = true) {
		const embed = this.msg.constructEmbed({
			setTitle: `${this.title}${paginate ? ` - Page ${page} of ${this.totalPages}` : ''}`,
			setDescription: `${this.prepend}${this.descriptions.slice((page as number * this.maxPerPage) - this.maxPerPage, page as number * this.maxPerPage).join('\n')}${this.append}`
		});
		if (this.thumbnails && this.thumbnails[this.page - 1]) {
			embed.setThumbnail(this.thumbnails[this.page - 1]);
		}
		return embed;
	}

	private async setup() {
		let emojis = ['⏮', '◀', '⬇', '▶', '⏭', '✅'];
		if (this.hastebin) emojis = [...emojis.slice(0, -1), '📜', emojis[5]];
		if (this.totalPages === 1) return this.msg.channel.send(this.pageEmbed(this.page, false));
		this.embedMsg = await this.msg.channel.send(this.pageEmbed(this.page)) as HavocMessage;
		for (const emoji of emojis) await this.embedMsg.react(emoji);
		const collector = this.embedMsg.createReactionCollector(
			(reaction, user) => emojis.includes(reaction.emoji.name) && user.id === this.msg.author.id,
			{ time: 100000 }
		);
		collector.on('collect', async reaction => {
			reaction.users.remove(this.msg.author);
			switch (reaction.emoji.name) {
				case '⏮':
					if (this.page !== 1) {
						this.embedMsg.edit(this.pageEmbed(this.page = 1));
					}
					break;
				case '◀':
					if (this.page > 1) {
						this.embedMsg.edit(this.pageEmbed(--this.page));
					}
					break;
				case '⬇':
					this.msg.createPrompt({
						msg: this.msg,
						initialMsg: 'enter the page you like to jump to.',
						invalidResponseMsg: `You need to enter a number between 1 to ${this.totalPages}, e.g: entering \`2\` will jump to page 2.`,
						target: (msg: HavocMessage) => {
							if (Number.isInteger(Number(msg.content)) && Number(msg.content) > 0 && Number(msg.content) <= this.totalPages) {
								return Number(msg.content);
							}
						}
					})
						.then(async ([response]: any) => this.embedMsg.edit(this.pageEmbed((await response).target)))
						.catch(err => Logger.error('Error from embed pagination prompt', err));
					break;
				case '▶':
					if (this.page < this.totalPages) {
						this.embedMsg.edit(this.pageEmbed(++this.page));
					}
					break;
				case '⏭':
					if (this.page !== this.totalPages) {
						this.embedMsg.edit(this.pageEmbed(this.page = this.totalPages));
					}
					break;
				case '📜':
					if (!this.hastebin) return;
					this.msg.sendEmbed({
						setDescription: await Util.haste(`${this.title}\n\n\n${this.descriptions.join('\n')}`)
					});
					break;
				case '✅':
					collector.stop();
					break;
			}
		});
		collector.on('end', async () => {
			await this.embedMsg.reactions.removeAll();
			if (this.hastebin) {
				this.embedMsg.embeds[0].setDescription(await Util.haste(`${this.title}\n\n\n${this.descriptions.join('\n')}`));
				delete this.embedMsg.embeds[0].title;
				this.embedMsg.edit(this.embedMsg.embeds[0]);
			}
		});
	}
}

export interface EmbedPaginationOptions {
	msg: HavocMessage;
	title: string;
	descriptions: string[];
	maxPerPage: number;
	page?: number;
	hastebin?: boolean;
	thumbnails?: string[];
	prepend?: string;
	append?: string;
}
