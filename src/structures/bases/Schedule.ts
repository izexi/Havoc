import HavocClient from '../../client/Havoc';

export default abstract class Schedule {
	public _client!: HavocClient;

	public endTime: number;

	public constructor(client: HavocClient, endTime: number) {
		Object.defineProperty(this, '_client', { value: client });
		this.endTime = endTime;
	}

	public abstract update(): Promise<any>;

	public abstract onError(): Promise<null>;

	public abstract end(): Promise<void>;
}
