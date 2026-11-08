import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  let activeLocale = locale;

  if (!activeLocale) {
    const paramValue = await rootParams.locale();

    if (!hasLocale(routing.locales, paramValue)) {
      notFound();
    }

    activeLocale = paramValue;
  }

  return {
    locale: activeLocale,
    messages: (await import(`../../messages/${activeLocale}.json`)).default,
  };
});
