const EventBus = (() => {
    const listeners = new Map();
    
    function on(event, handler) {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event).add(handler);
        
        return () => off(event, handler);
    }
    
    function off(event, handler) {
        if (!listeners.has(event)) return;
        listeners.get(event).delete(handler);
    }
    
    function emit(event, data) {
        if (!listeners.has(event)) return;
        
        listeners.get(event).forEach(handler => {
            try {
                handler(data);
            } catch (e) {
                console.error(`[EventBus] Error in handler for "${event}":`, e);
            }
        });
    }
    
    function once(event, handler) {
        const wrapper = (data) => {
            handler(data);
            off(event, wrapper);
        };
        on(event, wrapper);
    }
    
    function clear() {
        listeners.clear();
    }
    
    return {
        on,
        off,
        emit,
        once,
        clear
    };
})();

window.EventBus = EventBus;
