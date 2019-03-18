class Time {
	static _toMs(days = 0, hours = 0, mins = 0, secs = 0) {
		return days * 864e+5 +
            hours * 36e+5 +
            mins * 60000 +
            secs * 1000;
	}

	static parse(string) {
		const [, days, hours, mins, secs] = string
			.match(/(?:(\d+)d)?(?:\s?(\d+)h)?(?:\s?(\d+)m)?(?:\s?(\d+)s)?/);
		return this._toMs(days, hours, mins, secs);
	}
}

module.exports = Time;