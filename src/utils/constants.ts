import { Settings } from '@/types/settings';

// process.env расширен и мы видим переменные окружения
export const API_URL = `${process.env.API_ORIGIN}/api/afisha`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/afisha`;

// Если есть какой-то код который нужен при разработке,
// но не должен попасть в продакшен, то можно через этот флаг его отключить
export const DEVELOPMENT = process.env.NODE_ENV === 'development';

// Настройки для приложения
// так мы отделяем нашу реализацию, от особенностей конкретной верстки,
// но тут могут содержаться и другие настройки
export const SETTINGS: Settings = {

};
