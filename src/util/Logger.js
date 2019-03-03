const chalk = require("chalk");

class Logger {
	static log(text, type = "") {
		console.log(`[${chalk(new Date().toLocaleTimeString())}] ${type} ${text}`);
	}

	static status(text) {
		this.log(text, `[${chalk.green("STATUS")}]`);
	}

	static file(text) {
		this.log(text, `[${chalk.yellow("FILE")}]`);
	}

	static command(text) {
		this.log(text, `[${chalk.cyan("COMMAND")}]`);
	}

	static ping(text) {
		this.log(text, `[${chalk.magenta("PING")}]`);
	}

	static error(err) {
		this.log(`[${chalk.red("ERROR")}]`);
		console.error(err);
	}

	static unhandledRejection(rej) {
		this.log(`[${chalk.red("UNHANDLEDREJECTION")}]`);
		console.warn(rej);
	}
}

module.exports = Logger;
