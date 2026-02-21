import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

interface NumberInputProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  min = 0,
  max = Infinity,
  step = 1,
  value: externalValue,
  onChange,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState<number>(externalValue ?? min);
  const [isFocused, setIsFocused] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const setValue = (val: number) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  useEffect(() => {
    return () => stopAction();
  }, []);

  const increment = useCallback(() => {
    if (disabled) return;
    const updated = Math.min(max, value + step);
    setValue(updated);
  }, [value, max, step, disabled]);

  const decrement = useCallback(() => {
    if (disabled) return;
    const updated = Math.max(min, value - step);
    setValue(updated);
  }, [value, min, step, disabled]);

  const startAction = (action: () => void) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 80);
    }, 400);
  };

  const stopAction = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") return;

    const num = Number(raw);
    if (!isNaN(num)) {
      const rounded = Math.round(num / step) * step;
      setValue(Math.min(max, Math.max(min, rounded)));
    }
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Decrement */}
      <button
        type="button"
        disabled={disabled || value <= min}
        onMouseDown={() => startAction(decrement)}
        onMouseUp={stopAction}
        onMouseLeave={stopAction}
        className="group relative w-11 h-11 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-5 h-5 mx-auto text-gray-700 group-hover:text-red-500 transition-colors" />
      </button>

      {/* Input */}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-24 h-11 text-center text-lg font-semibold rounded-xl border transition-all duration-200 bg-white/60 backdrop-blur-md shadow-sm focus:outline-none ${
            isFocused
              ? "border-blue-400 ring-2 ring-blue-200 shadow-md scale-105"
              : "border-gray-200"
          }`}
          style={{
            appearance: "textfield",
            MozAppearance: "textfield",
          }}
        />
      </div>

      {/* Increment */}
      <button
        type="button"
        disabled={disabled || value >= max}
        onMouseDown={() => startAction(increment)}
        onMouseUp={stopAction}
        onMouseLeave={stopAction}
        className="group relative w-11 h-11 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5 mx-auto text-gray-700 group-hover:text-blue-500 transition-colors" />
      </button>

      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};