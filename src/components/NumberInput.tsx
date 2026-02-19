import { useState, useRef, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';

export const NumberInput = ({ min = 0, max = Infinity, step = 1, value: externalValue, onChange }) => {
  const [internalValue, setInternalValue] = useState(externalValue || min);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Use controlled value if provided, otherwise use internal state
  const value = externalValue !== undefined ? externalValue : internalValue;
  const setValue = onChange || setInternalValue;

    const increment = useCallback(() => {
    let current = value === '' ? min : Number(value);
    const updated = Math.min(max, current + step);
    setValue(updated);
    }, [value, min, max, step, setValue]);

    const decrement = useCallback(() => {
    let current = value === '' ? min : Number(value);
    const updated = Math.max(min, current - step);
    setValue(updated);
    }, [value, min, step, setValue]);


  const startAction = (action) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 100);
    }, 500);
  };

  const stopAction = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleChange = (event) => {
    const rawValue = event.target.value;
    if (rawValue === '') {
      setValue('');
      return;
    }

    const numValue = Number(rawValue);
    if (!isNaN(numValue)) {
      // Round to nearest step
      const roundedValue = Math.round(numValue / step) * step;
      setValue(Math.min(max, Math.max(min, roundedValue)));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value === '') {
      setValue(min);
    }
  };

  const currentValue = value === '' ? min : value;

  return (
    <div className="flex items-center gap-2">
      {/* Decrement button */}
      <button
        type="button"
        onMouseDown={() => startAction(decrement)}
        onMouseUp={stopAction}
        onMouseLeave={stopAction}
        onTouchStart={() => startAction(decrement)}
        onTouchEnd={stopAction}
        disabled={currentValue <= min}
        className={`group relative w-10 h-10 rounded-lg font-bold text-lg transition-all duration-200 ${
          currentValue <= min
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
        }`}
        aria-label="Decrement value"
      >
        <div className={`absolute inset-0 rounded-lg transition-opacity ${
          currentValue <= min ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        } bg-gradient-to-br from-red-300 to-red-400`}></div>
        <Minus className="relative z-10 w-5 h-5 mx-auto" />
      </button>

      {/* Input field */}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          className={`w-20 h-10 text-center text-lg bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
            isFocused
              ? 'border-blue-400 shadow-md shadow-blue-100 scale-105'
              : 'border-gray-200 shadow-sm'
          }`}
          style={{
            appearance: 'textfield',
            MozAppearance: 'textfield',
          }}
        />
        <style>{`
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        `}</style>
      </div>

      {/* Increment button */}
      <button
        type="button"
        onMouseDown={() => startAction(increment)}
        onMouseUp={stopAction}
        onMouseLeave={stopAction}
        onTouchStart={() => startAction(increment)}
        onTouchEnd={stopAction}
        disabled={currentValue >= max}
        className={`group relative w-10 h-10 rounded-lg font-bold text-lg transition-all duration-200 ${
          currentValue >= max
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
        }`}
        aria-label="Increment value"
      >
        <div className={`absolute inset-0 rounded-lg transition-opacity ${
          currentValue >= max ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        } bg-gradient-to-br from-blue-300 to-cyan-400`}></div>
        <Plus className="relative z-10 w-5 h-5 mx-auto" />
      </button>
    </div>
  );
};
