import { defaultLang, routes, showDefaultLang } from "@i18n/ui";
import { resources } from "./locales";

type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : never;
    }[keyof T]
  : never;
type NestedKeys = DeepKeyOf<typeof resources["en"]>;
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in resources) return lang as keyof typeof resources;
  return defaultLang;
}
export function getRouteFromUrl(url: URL): string | undefined {
  const pathname = new URL(url).pathname;
  const parts = pathname?.split("/");
  const path = parts.pop() || parts.pop();

  if (path === undefined) {
    return undefined;
  }

  const currentLang = getLangFromUrl(url);

  if (defaultLang === currentLang) {
    const route = Object.values(routes)[0];
    return route[path] !== undefined ? route[path] : undefined;
  }

  const getKeyByValue = (
    obj: Record<string, string>,
    value: string,
  ): string | undefined => {
    return Object.keys(obj).find((key) => obj[key] === value);
  };

  const reversedKey = getKeyByValue(routes[currentLang], path);

  if (reversedKey !== undefined) {
    return reversedKey;
  }

  return undefined;
}
const get = (obj:unknown, path, defaultValue = ''):string => { 
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => {
        return (res !== null && res !== undefined ? res[key] : res)
      }, obj );

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};
export function useTranslations(lang: keyof typeof resources) {
  return function t(key: NestedKeys) {
    return get(resources,`${lang}.${key}`,get(resources,`${defaultLang}.${key}`,(key as string)));
  };
}
export function useTranslatedPath(lang: keyof typeof resources) {

  const translatePath=(path: string, l: string = (lang as string)) =>{ 
    
    const pathName = path.replaceAll("/", "");
    const hasTranslation = routes[pathName] !== undefined;
    const translatedPath = hasTranslation ? "/" + routes[pathName][lang] : path;
      return !showDefaultLang && l === defaultLang
      ? translatedPath
      : `/${l}${translatedPath}`;
  };
  return{
    translatePath,
  }
}
