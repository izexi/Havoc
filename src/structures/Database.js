// Inspired by keyv https://github.com/lukechilds/keyv

const { dbURI } = require("../../config.json");
const { Pool } = require("pg");
const { parse, stringify } = require("json-buffer");
const pool = new Pool({ connectionString: dbURI });
const sql = require("sql");

class Database {
	constructor() {
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
		this.query(queryStr);
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
		return `${this.category}:${key}`;
	}

	query(queryStr, value = true) {
		return pool.query(queryStr).then(({ rows }) => {
			const row = rows[0];
			return (row ? (value ? parse(row.value) : row) : null);
		});
	}

	get(key) {
		const queryStr = this._queryBuilder({
			type: "SELECT",
			key: this._dbKey(key),
		});
		return this.query(queryStr);
	}

	set(key, value) {
		const queryStr = this._queryBuilder({
			type: "INSERT",
			key: this._dbKey(key),
			value: stringify(value),
		});
		return this.query(queryStr).then(() => true);
	}

	delete(key) {
		return this.exists(key).then((exists) => {
			if (!exists) return Promise.resolve(false);
			const queryStr = this._queryBuilder({
				type: "DELETE",
				key: this._dbKey(key),
			});
			return this.query(queryStr);
		});
	}

	exists(key) {
		const queryStr = this._queryBuilder({
			type: "SELECT",
			key: this._dbKey(key),
		});
		return this.query(queryStr).then((row) => Boolean(row));
	}

	lessThan(value) {
		return this.query(`SELECT * FROM "havoc" WHERE "key" ~ '^${this.category}:' AND CAST(SUBSTRING(key, ${this.category.length + 2}) AS BIGINT) <= ${value}`, false)
			.then((res) => res)
			.catch(() => null);
	}
}

module.exports = Database;