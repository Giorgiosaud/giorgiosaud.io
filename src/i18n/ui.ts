import * as esTranslations from "@i18n/locales/es";
import * as enTranslations from "@i18n/locales/en";
export const languages=[
  {
    name:"English",
    code:"en",
    path:'/'
  },
  {
    name:"Español",
    code:"es",
    path:'/es'
  }
] as const;
export const showDefaultLang = false as const;

export const defaultLang = "en" as const;
export const routes = {
  notebook:{
    es:"cuaderno",
    en: "notebook",
  },
  about:{
    es:"acerca-de-mi",
    en: "about",
  },
  contact:{
    es:"contactame",
    en: "contact",
  },
  portfolio:{
    es:"mi-portfolio",
    en: "portfolio",
  },
} as const;
