import { Select } from "@/components";
import { useTranslation } from "react-i18next";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "🇬🇧 EN" },
  { value: "ru", label: "🇷🇺 RU" },
  { value: "hy", label: "🇦🇲 HY" },
];

export function LanguageSelect() {
  const { i18n } = useTranslation();

  return (
    <Select
      options={LANGUAGE_OPTIONS}
      className="!w-auto"
      placeholder="🇦🇲 HY"
      variant="ghost"
      value={i18n.language}
      onChange={(value) => i18n.changeLanguage(value)}
    />
  );
}