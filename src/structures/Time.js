class Time {
	static _toMs(weeks = 0, days = 0, hours = 0, mins = 0, secs = 0) {
		return weeks * 6048e+5 +
			days * 864e+5 +
            hours * 36e+5 +
            mins * 60000 +
            secs * 1000;
	}

	static parse(string) {
		const [, weeks, days, hours, mins, secs] = string
			.match(/(?:(\d+)w)?(?:\s?(\d+)d)?(?:\s?(\d+)h)?(?:\s?(\d+)m)?(?:\s?(\d+)s)?/);
		return this._toMs(weeks, days, hours, mins, secs);
	}
}

module.exports = Time;