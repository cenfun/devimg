import { useState, useEffect } from 'react';

export const useDebounce = (cb, delay = 500) => {
    const [debounceValue, setDebounceValue] = useState(cb);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(cb);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [cb, delay]);
    return debounceValue;
};

export const selectAll = (e) => {
    e.target.select();
};
