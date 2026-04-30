const listeners: Record<string, (() => void)[]> = {};

export const appEvents = {
    emit(event: string) {
        (listeners[event] || []).forEach(fn => fn());
    },
    on(event: string, fn: () => void) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(fn);
        return () => {
            listeners[event] = (listeners[event] || []).filter(f => f !== fn);
        };
    }
};
