type Entry<T> = { refs: number; status: 'loading' | 'ready' | 'error'; promise: Promise<T>; controller: AbortController; value?: T; dispose?: (value: T) => void };
/** Each acquire owns one reference, even when requests are deduplicated. */
export class AssetManager<T> {
  private entries = new Map<string, Entry<T>>();
  get size() { return this.entries.size; }
  refs(key: string) { return this.entries.get(key)?.refs ?? 0; }
  status(key: string) { return this.entries.get(key)?.status ?? 'idle'; }
  acquire(key: string, loader: (signal: AbortSignal) => Promise<T>, dispose?: (value: T) => void): Promise<T> {
    const old = this.entries.get(key);
    if (old && old.status !== 'error') { old.refs++; return old.promise; }
    const controller = new AbortController();
    const entry: Entry<T> = { refs: 1, status: 'loading', controller, promise: undefined!, dispose };
    this.entries.set(key, entry);
    // Loader is called immediately so release() can cancel from the same tick.
    entry.promise = loader(controller.signal).then(value => {
      if (this.entries.get(key) !== entry || controller.signal.aborted) { dispose?.(value); throw Error('aborted'); }
      entry.status = 'ready'; entry.value = value; return value;
    }, error => { if (this.entries.get(key) === entry) { entry.status = 'error'; entry.refs = 0; } throw error; });
    return entry.promise;
  }
  release(key: string) {
    const e = this.entries.get(key); if (!e) return;
    e.refs = Math.max(0, e.refs - 1);
    if (e.refs > 0) return;
    this.entries.delete(key); e.controller.abort();
    if (e.value !== undefined) e.dispose?.(e.value);
  }
}
