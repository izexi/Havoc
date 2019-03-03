// Inspired by keyv https://github.com/lukechilds/keyv

const { dbURI } = require("../../config.json");
const { Pool } = require("pg");
const { query } = new Pool({ connectionString: dbURI });
const { parse, stringify } = require("json-buffer");
const sql = require("sql");

class Database {
	constructor(name) {
		this.name = name;
		this.sql = sql.define({
			name: "havoc",
			columns: [{
				name: "key",
				primaryKey: true,
				dataType: "VARCHAR(255)",
			},
			{
				name: "value",
				dataType: "TEXT",
			}],
		});
		const queryStr = this._queryBuilder({ type: "CREATE" });
		this._query(queryStr);
	}

	_queryBuilder(options) {
		const { type, key, value } = options;
		switch (type) {
			case "CREATE":
				return this.sql.create().ifNotExists().toString();
			case "SELECT":
				return this.sql.select().where({ key }).toString();
			case "INSERT":
				return this.sql.insert({ key, value }).onConflict({
					columns: ["key"],
					update: ["value"],
				}).toString();
			case "DELETE":
				return this.sql.delete().where({ key }).toString();
		}
	}

	_dbKey(key) {
		return `${this.name}:${key}`;
	}

	_query(queryStr) {
		return query(queryStr).then(({ rows }) => {
			const row = rows[0];
			return (row ? parse(row.value) : null);
		});
	}

	get(key) {
		const queryStr = this._queryBuilder({
			type: "SELECT",
			key: this._dbKey(key),
		});
		return this._query(queryStr);
	}

	set(key, value) {
		const queryStr = this._queryBuilder({
			type: "INSERT",
			key: this._dbKey(key),
			value: stringify(value),
		});
		return this._query(queryStr).then(() => true);
	}

	delete(key) {
		return this.exists(key).then((exists) => {
			if (!exists) return new Promise((r) => r(false));
			const queryStr = this._queryBuilder({
				type: "DELETE",
				key: this._dbKey(key),
			});
			return this._query(queryStr);
		});
	}

	exists(key) {
		const queryStr = this._queryBuilder({
			type: "SELECT",
			key: this._dbKey(key),
		});
		return this._query(queryStr).then((row) => Boolean(row));
	}
}

module.exports = Database;