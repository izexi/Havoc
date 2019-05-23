export default abstract class Handler<K, V> {
	abstract add(key: K, value: V): void;
}
