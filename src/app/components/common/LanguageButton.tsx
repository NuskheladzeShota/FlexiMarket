type LanguageButtonProps = {
    language: string;
    label: string;
    onClick: (lng: string) => void;
};

export const LanguageButton: React.FC<LanguageButtonProps> = ({ language, label, onClick }) => (
    <button
        onClick={() => onClick(language)}
        className="px-4 py-2 rounded text-white transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
            backgroundColor: language === "en" ? "#3b82f6" : "#10b981",
        }}
    >
        {label}
    </button>
);