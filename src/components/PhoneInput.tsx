import React from "react";
import { ChevronDown } from "lucide-react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

/* ---------------------------------- */

type Country = {
  name: string;
  code: CountryCode;
  dialCode: string;
  flag: string;
};

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

const countries: Country[] = getCountries().map((code) => ({
  code,
  dialCode: `+${getCountryCallingCode(code)}`,
  flag: getFlagEmoji(code),
  name:
    new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
}));

/* ---------------------------------- */

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  variant?: "default" | "primary";

  /** E.164 format value ex: +37499123456 */
  value?: string | null;

  /** returns VALID phone or null */
  onChange?: (value: string | null) => void;
}

export function PhoneInput({
  label,
  hint,
  error,
  required,
  variant = "default",
  className = "",
  value,
  onChange,
  ...props
}: PhoneInputProps) {
  const defaultCountry =
    countries.find((c) => c.code === "AM") || countries[0];

  const [selectedCountry, setSelectedCountry] =
    React.useState<Country>(defaultCountry);

  const [inputValue, setInputValue] = React.useState("");

  const [open, setOpen] = React.useState(false);

  /* ---------------- Sync external value ---------------- */

  React.useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }

    const phone = parsePhoneNumberFromString(value);

    if (phone) {
      const country =
        countries.find((c) => c.code === phone.country) ||
        defaultCountry;

      setSelectedCountry(country);

      const formatter = new AsYouType(country.code);
      setInputValue(formatter.input(phone.nationalNumber));
    }
  }, [value]);

  /* ---------------- Handle Change ---------------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    const formatter = new AsYouType(selectedCountry.code);
    const formatted = formatter.input(raw);

    setInputValue(formatted);

    const fullNumber = `${selectedCountry.dialCode}${raw.replace(
      /\D/g,
      ""
    )}`;

    const valid = isValidPhoneNumber(
      fullNumber,
      selectedCountry.code
    );

    onChange?.(valid ? fullNumber : null);
  };

  /* ---------------- Styles ---------------- */

  const borderVariant =
    variant === "primary"
      ? "border-primary focus:ring-primary"
      : "border-slate-200 focus:ring-indigo-500";

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Country Picker */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-3 bg-slate-50 border border-r-0 rounded-l-lg ${borderVariant}`}
        >
          <span>{selectedCountry.flag}</span>
          <span className="text-sm">{selectedCountry.dialCode}</span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 z-20 mt-1 w-60 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {countries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountry(c);
                  setInputValue("");
                  setOpen(false);
                  onChange?.(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 text-left"
              >
                <span>{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-slate-500 text-sm">
                  {c.dialCode}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <input
          {...props}
          value={inputValue}
          onChange={handleChange}
          inputMode="tel"
          className={`w-full pl-4 pr-4 py-3 bg-slate-50 border rounded-r-lg
            focus:outline-none focus:ring-2 transition-all
            placeholder:text-slate-400
            ${borderVariant}
            ${error ? "!border-red-500 focus:ring-red-500" : ""}`}
          placeholder="Phone number"
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}