import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./app/locales/en.json";
import ka from "./app/locales/ka.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ka: { translation: ka },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
