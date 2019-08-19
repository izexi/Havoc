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
		return `\`\`\`${lang}\n${text.replace(/```/g, '`\u200b``')}\n\`\`\``;
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
	smallCaps(str: string) {
		const obj: { [key: string]: string } = {
			a: 'ᴀ',
			b: 'ʙ',
			c: 'ᴄ',
			d: 'ᴅ',
			e: 'ᴇ',
			f: 'ғ',
			g: 'ɢ',
			h: 'ʜ',
			i: 'ɪ',
			j: 'ᴊ',
			k: 'ᴋ',
			l: 'ʟ',
			m: 'ᴍ',
			n: 'ɴ',
			o: 'ᴏ',
			p: 'ᴘ',
			q: 'ǫ',
			r: 'ʀ',
			s: 's',
			t: 'ᴛ',
			u: 'ᴜ',
			v: 'ᴠ',
			w: 'ᴡ',
			x: 'x',
			y: 'ʏ',
			z: 'ᴢ'
		};
		return str.replace(new RegExp(Object.keys(obj).join('|'), 'gi'), letter => obj[letter] || letter);
	},
	logEvents: [
		'channel creations',
		'channel deletions',
		'channel updates',
		'command usage',
		'emoji creations',
		'emoji deletions',
		'emoji updates',
		'server updates',
		'member bans',
		'member joins',
		'member leaves',
		'member unbans',
		'member updates',
		'message clears',
		'message edits',
		'messages deletions',
		'role creations',
		'role deletions',
		'role updates',
		'voice channel updates'
	],
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
	secondsToHM(seconds: number) {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor(seconds % 3600 / 60);

		const hours = h > 0 ? `${h} hour` : '';
		const minutes = m > 0 ? `${m} ${this.plural('minute', m)}` : '';
		return `${hours}${minutes ? ` ${minutes}` : ''}`;
	},
	emojiNumber(num: number) {
		return this.emojiNumbers[num];
	}
};
