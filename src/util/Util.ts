import fetch from 'node-fetch';

export default {
	async haste(body: string, extension: string = 'txt') {
		return fetch('https://hasteb.in/documents', { method: 'POST', body })
			.then(async res => `https://hasteb.in/${(await res.json()).key}.${extension}`)
			// eslint-disable-next-line promise/no-nesting
			.catch(async () => fetch('https://paste.nomsy.net/documents', { method: 'POST', body })
				.then(async res => `https://paste.nomsy.net/${(await res.json()).key}.${extension}`));
	},
	plural(str: string, int: number) {
		return str + (!int || int > 1 ? 's' : '');
	},
	captialise(str: string) {
		return str.replace(/./, letter => letter.toUpperCase());
	},
	codeblock(text: string, lang: string = '') {
		return `\`\`\`${lang}\n${text}\n\`\`\``;
	},
	normalizePermFlag(perm: string) {
		return perm
			.toLowerCase()
			.replace(/(^|"|_)(\S)/g, s => s.toUpperCase())
			.replace(/_/g, ' ')
			.replace(/Guild/g, 'Server')
			.replace(/Use Vad/g, 'Use Voice Acitvity');
	},
	randomInt(min: number, max: number) {
		return ~~(Math.random() * (max - min + 1)) + min;
	},
	arrayify(arg: any) {
		return Array.isArray(arg) ? arg : [arg];
	},
	ordinal(n: number) {
		// eslint-disable-next-line
		return n + ([, 'st', 'nd', 'rd'][n % 100 >> 3 ^ 1 && n % 10]! || 'th');
	},
	auditClean(reason: string) {
		return reason.replace(/`/g, '');
	},
	// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
	emojiNumbers: {
		1: '1⃣',
		2: '2⃣',
		3: '3⃣',
		4: '4⃣',
		5: '5⃣',
		6: '6⃣',
		7: '7⃣',
		8: '8⃣',
		9: '9⃣',
		10: '🔟'
	} as { [key: string]: string },
	emojiNumber(num: number) {
		return this.emojiNumbers[num];
	}
};
