export default {
	_toMs(weeks: string | number = 0, days: string | number = 0, hours: string | number = 0, mins: string | number = 0, secs: string | number = 0) {
		return (Number(weeks) * 6048e+5) +
			(Number(days) * 864e+5) +
			(Number(hours) * 36e+5) +
			(Number(mins) * 60000) +
			(Number(secs) * 1000);
	},
	parse(str: string) {
		if (Number(str)) return this._toMs(0, 0, 0, str);
		const [, weeks, days, hours, mins, secs]: RegExpMatchArray = str
			.match(/(?:(\d+)w)?(?:\s?(\d+)d)?(?:\s?(\d+)h)?(?:\s?(\d+)m)?(?:\s?(\d+)s)?/) || [];
		return this._toMs(weeks, days, hours, mins, secs);
	}
};
