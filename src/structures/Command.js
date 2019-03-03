class Command {
	constructor(__path, options = {}) {
		const path = __path.split("\\");
		this.name = path.pop().slice(0, -3);
		this.category = path.pop();
		this.description = options.description;
		this.aliases = options.aliases;
		this.args = options.args;
		this.prompt = options.prompt;
		/*
			opts(x) -> {
				1: deleteable
				1 << 1: editable
				1 << 2: target
				1 << 3: args required
			}
		*/
		this.opts = options.opts;
		this.usage = options.usage;
		this.clientPerms = options.clientPerms;
		this.memberPerms = options.memberPerms;
	}
}

module.exports = Command;