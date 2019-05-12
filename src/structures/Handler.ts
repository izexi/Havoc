export default abstract class Handler<K, V> {
	abstract get(key: K): V | V[];

	abstract remove(key: K): void;

	abstract add(key: K, value: V): void;

	abstract reload(key: K): void;
}
