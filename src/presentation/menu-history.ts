export class MenuHistory<T extends { page: string }> {
  private entries: T[] = [];

  get previous(): T | undefined {
    return this.entries.at(-1);
  }

  visit(current: T, destination: string): void {
    if (current.page !== destination && current.page !== 'battle') this.entries.push(current);
  }

  back(): T {
    const previous = this.entries.pop();
    if (!previous) throw new Error('There is no previous menu.');
    return previous;
  }

  clear(): void {
    this.entries = [];
  }
}
