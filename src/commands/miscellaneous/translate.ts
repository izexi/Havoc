/* eslint-disable @typescript-eslint/no-var-requires */
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
const translate = require('google-translate-api');
const langMap = require('../../assets/langmap.json');
const langs = require('../../assets/langs.json');

export default class Translate extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Translates the inputted text to English (by default) / optional flag language via Google Translate.',
			aliases: new Set(['t']),
			target: 'string',
			prompt: {
				initialMsg: ['enter the text that you would like to translate with an optional language that you would like to translate to as a flag (defaulted to English).']
			},
			flags: new Set(Object.values(langMap as { aliases: string[] }[]).reduce((arr: string[], lang) => arr.concat(lang.aliases), []))
		});
	}

	public async run(this: HavocClient, { msg, flag, targetObj: { target } }: { msg: HavocMessage; flag: string; targetObj: { target: string } }) {
		const to = flag || 'en';
		const translation = Object.values(langMap as { aliases: string[]; flag: string }[]).find(lang => lang.aliases.includes(to))!;
		translate(target, { to }).then((res: { text: string; from: { language: { iso: string } } }) => {
			msg.sendEmbed({
				setDescription: `:flag_${translation.flag}: ${res.text}`,
				attachFiles: ['src/assets/images/translate.png'],
				setFooter: [
					`Translated from ${langs[res.from.language.iso]} to ${langs[translation.aliases[0]]}`,
					'attachment://translate.png'
				]
			}, msg.author.toString());
		}).catch(async () => {
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}** there was an error while attempting to translate your text.`
			});
		});
	}
}
