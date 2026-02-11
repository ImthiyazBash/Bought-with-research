'use client';

import { createContext, useContext, ReactNode } from 'react';

type Messages = {
  [key: string]: any;
};

const I18nContext = createContext<Messages>({});

export function I18nProvider({ children, messages }: { children: ReactNode; messages: Messages }) {
  return <I18nContext.Provider value={messages}>{children}</I18nContext.Provider>;
}

export function useTranslations(namespace?: string) {
  const messages = useContext(I18nContext);

  return (key: string) => {
    const keys = namespace ? `${namespace}.${key}`.split('.') : key.split('.');
    let value: any = messages;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };
}

export function useLocale() {
  // This will be set via URL parameter
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const locale = path.split('/')[1];
    return locale === 'de' ? 'de' : 'en';
  }
  return 'en';
}
