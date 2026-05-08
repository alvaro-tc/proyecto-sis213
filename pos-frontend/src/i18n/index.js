import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";

const STORAGE_KEY = "pos-lang";
const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: saved || "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export const setLanguage = (lng) => {
  i18n.changeLanguage(lng);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng);
  }
};

export default i18n;
