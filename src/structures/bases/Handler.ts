export default abstract class Handler<K, V> {
	abstract add(key: K, value: V): void;

	abstract remove(key: K): void;

	abstract get(key: K): V | V[] | undefined;

	abstract reload(key: K | V): void;
}
