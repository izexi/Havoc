class Command {
	constructor(__path, options = {}) {
		const path = __path.split("\\");
		this.name = path.pop().slice(0, -3);
		this.category = path.pop();
		/*
			opts(x) -> {
				1: deleteable
				1 << 1: editable
				1 << 2: target
				1 << 3: args required
			}
		*/
		Object.assign(this, options);
	}
}

module.exports = Command;