const Random = (() => {
    function secureRandomInt(min, max) {
        if (window.crypto && window.crypto.getRandomValues) {
            const range = max - min + 1;
            const bits = Math.ceil(Math.log2(range));
            const bytes = Math.ceil(bits / 8);
            const mask = (1 << bits) - 1;
            
            let value;
            do {
                const buffer = new Uint8Array(bytes);
                window.crypto.getRandomValues(buffer);
                value = 0;
                for (let i = 0; i < bytes; i++) {
                    value = (value << 8) | buffer[i];
                }
                value = value & mask;
            } while (value >= range);
            
            return min + value;
        } else {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    function fisherYatesShuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = secureRandomInt(0, i);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    function pickOne(array) {
        if (array.length === 0) return null;
        return array[secureRandomInt(0, array.length - 1)];
    }

    function pickMany(array, count, { allowRepeat = false, exclude = [] } = {}) {
        if (array.length === 0) return [];
        if (count <= 0) return [];
        
        let available = [...array];
        
        if (!allowRepeat) {
            available = available.filter(item => !exclude.includes(item));
        }
        
        if (available.length === 0) return [];
        
        const results = [];
        const actualCount = allowRepeat ? count : Math.min(count, available.length);
        
        for (let i = 0; i < actualCount; i++) {
            const index = secureRandomInt(0, available.length - 1);
            const selected = available[index];
            results.push(selected);
            
            if (!allowRepeat) {
                available.splice(index, 1);
            }
        }
        
        return results;
    }

    function shuffle(array) {
        return fisherYatesShuffle(array);
    }

    function rollDice(sides = 6) {
        return secureRandomInt(1, sides);
    }

    function rollMultipleDice(count = 1, sides = 6) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(rollDice(sides));
        }
        return results;
    }

    function pickWeighted(items, weights) {
        if (items.length !== weights.length || items.length === 0) {
            return null;
        }
        
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = secureRandomInt(1, totalWeight);
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    return {
        secureRandomInt,
        shuffle,
        pickOne,
        pickMany,
        rollDice,
        rollMultipleDice,
        pickWeighted
    };
})();

window.Random = Random;
