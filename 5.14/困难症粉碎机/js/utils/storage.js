const Storage = (() => {
    const STORAGE_PREFIX = 'difficulty-smasher:';
    const DEBOUNCE_MS = 100;
    
    const debounceTimers = new Map();
    
    function debounce(key, fn, delay) {
        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
        }
        const timer = setTimeout(fn, delay);
        debounceTimers.set(key, timer);
        return timer;
    }
    
    function getFullKey(key) {
        return STORAGE_PREFIX + key;
    }
    
    function isAvailable() {
        try {
            const testKey = getFullKey('__test__');
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    function get(key, defaultValue = null) {
        try {
            const fullKey = getFullKey(key);
            const value = localStorage.getItem(fullKey);
            if (value === null) {
                return defaultValue;
            }
            return JSON.parse(value);
        } catch (e) {
            console.warn(`[Storage] Failed to get "${key}":`, e);
            return defaultValue;
        }
    }
    
    function set(key, value, { debounce = false } = {}) {
        const doSave = () => {
            try {
                const fullKey = getFullKey(key);
                const serialized = JSON.stringify(value);
                localStorage.setItem(fullKey, serialized);
                return true;
            } catch (e) {
                console.warn(`[Storage] Failed to set "${key}":`, e);
                return false;
            }
        };
        
        if (debounce) {
            debounce(`set:${key}`, doSave, DEBOUNCE_MS);
            return true;
        }
        
        return doSave();
    }
    
    function remove(key) {
        try {
            const fullKey = getFullKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.warn(`[Storage] Failed to remove "${key}":`, e);
            return false;
        }
    }
    
    function has(key) {
        try {
            const fullKey = getFullKey(key);
            return localStorage.getItem(fullKey) !== null;
        } catch (e) {
            return false;
        }
    }
    
    function clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.warn('[Storage] Failed to clear:', e);
            return false;
        }
    }
    
    function getAll() {
        const result = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    const shortKey = key.slice(STORAGE_PREFIX.length);
                    try {
                        result[shortKey] = JSON.parse(localStorage.getItem(key));
                    } catch {
                        result[shortKey] = null;
                    }
                }
            }
        } catch (e) {
            console.warn('[Storage] Failed to getAll:', e);
        }
        return result;
    }
    
    function transaction(operations) {
        const results = {};
        operations.forEach(op => {
            switch (op.type) {
                case 'get':
                    results[op.key] = get(op.key, op.defaultValue);
                    break;
                case 'set':
                    results[op.key] = set(op.key, op.value);
                    break;
                case 'remove':
                    results[op.key] = remove(op.key);
                    break;
            }
        });
        return results;
    }
    
    return {
        isAvailable,
        get,
        set,
        remove,
        has,
        clear,
        getAll,
        transaction
    };
})();

window.Storage = Storage;
