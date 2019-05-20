import { Pool } from 'pg';
/* eslint-disable @typescript-eslint/no-var-requires */
const { dbURI } = require('../../config.json');
const { parse, stringify } = require('json-buffer');
const sql = require('sql');
const pool = new Pool({ connectionString: dbURI });

export default class Database {
	public sql: any;

	public category!: string;

	public constructor() {
		this.sql = sql.define({
			name: 'havoc',
			columns: [{
				name: 'key',
				primaryKey: true,
				dataType: 'VARCHAR(255)'
			},
			{
				name: 'value',
				dataType: 'TEXT'
			}]
		});
		const queryStr = this._queryBuilder({ type: 'CREATE' });
		this.query(queryStr!);
	}

	public async query(queryStr: string, value: boolean = true): Promise<any> {
		return pool.query(queryStr).then(async ({ rows }) => {
			const row = rows[0];
			return (row ? (value ? parse(row.value) : row) : null);
		});
	}

	public async get(key: string): Promise<any> {
		const queryStr = this._queryBuilder({
			type: 'SELECT',
			key: this._dbKey(key)
		});
		return this.query(queryStr!);
	}

	public async set(key: any, value: any): Promise<boolean> {
		const queryStr = this._queryBuilder({
			type: 'INSERT',
			key: this._dbKey(key),
			value: stringify(value)
		});
		return this.query(queryStr!).then(() => true);
	}

	public async delete(key: string): Promise<any> {
		return this.exists(key).then(async exists => {
			if (!exists) return Promise.resolve(false);
			const queryStr = this._queryBuilder({
				type: 'DELETE',
				key: this._dbKey(key)
			});
			return this.query(queryStr!);
		});
	}

	public async exists(key: string): Promise<boolean> {
		const queryStr = this._queryBuilder({
			type: 'SELECT',
			key: this._dbKey(key)
		});
		return this.query(queryStr!).then(row => Boolean(row));
	}

	public async lessThan(value: number): Promise<any> {
		return this.query(`SELECT * FROM "havoc" WHERE "key" ~ '^${this.category}:' AND CAST(SUBSTRING(key, ${this.category.length + 2}) AS BIGINT) <= ${value}`, false)
			.catch(() => null);
	}

	private _queryBuilder(options: { type?: string; key?: string; value?: string }): string | undefined {
		const { type, key, value } = options;
		switch (type) {
			case 'CREATE':
				return this.sql.create().ifNotExists().toString();
			case 'SELECT':
				return this.sql.select().where({ key }).toString();
			case 'INSERT':
				return this.sql.insert({ key, value }).onConflict({
					columns: ['key'],
					update: ['value']
				}).toString();
			case 'DELETE':
				return this.sql.delete().where({ key }).toString();
		}
	}

	private _dbKey(key: string): string {
		return `${this.category}:${key}`;
	}
}
