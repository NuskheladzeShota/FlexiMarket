import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LanguageButton: React.FC<{ onClick: (lng: string) => void }> = ({ onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-300"
      >
        <Globe size={18} /> {t("language")} <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-32 bg-black dark:bg-gray-800 shadow-lg rounded-md">
          <button
            onClick={() => {
              onClick("en");
              setIsOpen(false);
            }}
            className="block px-4 py-2 w-full text-left text-white hover:bg-gray-900 rounded-md dark:hover:bg-gray-700 transition duration-200"
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => {
              onClick("ka");
              setIsOpen(false);
            }}
            className="block px-4 py-2 w-full text-left text-white hover:bg-gray-900 rounded-md  dark:hover:bg-gray-700 transition duration-200"
          >
            🇬🇪 ქართული
          </button>
        </div>
      )}
    </div>
  );
};
