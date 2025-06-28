
import * as en from "@i18n/locales/en";
import * as es from "@i18n/locales/es";

export const languages = [
  {
    name: "English",
    code: "en",
    path: "",
  },
  {
    name: "Español",
    code: "es",
    path: "/es",
  },
] as const;


export const defaultLang = "en" as const;

export const resources = {
  es,
  en
};
