export const Cache = {
    put(name: string, value: string): void {
        name = `cache_${name.trim()}`;   
        localStorage.setItem(name, value);
    },
    peek(name: string): string {
        name = `cache_${name.trim()}`;   
        return localStorage.getItem(name) ?? '';
    },
    take(name: string): string {
        name = `cache_${name.trim()}`;   
        const value = localStorage.getItem(name) ?? '';
        localStorage.removeItem(name);
        return value;
    }
}
