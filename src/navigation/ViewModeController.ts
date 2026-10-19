export type ViewMode = 'first' | 'third' | 'overview';
export function toggleView<T extends { mode: ViewMode }>(state: T): T {
  return { ...state, mode: state.mode === 'first' ? 'third' : 'first' };
}
