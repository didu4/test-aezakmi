# Тестовое задание (Frontend React + TS)

SPA (React + TS) по макету из Figma из 3 страниц.

ссылка на макет: https://www.figma.com/design/p3bs7nOd0noohqkGTjOvTm/Test-Task?node-id=0-1&t=yC6nWIOopGpPEzFP-1

## API

Изначально был выбран Frankfurter API, однако, видимо, не работает без ВПН. Пришлось менять на API от ЦБ РФ: https://www.cbr-xml-daily.ru/daily_json.js
В связи с таким выбором API стоит сказать, что в таблице курсы относительно доллара. На сайте ЦБ они - относительно рубля. Поэтому цифры могут не совпадать.
Также отмечу, что ЦБ не предоставляет данные для графика, поэтому у них они моковые.

Возможно, при необходимости, изменю на более корректный API.

## Установка и запуск

# Клонирование
```bash
git clone https://github.com/didu4/test-aezakmi.git
```
# Установка зависимостей
```bash
npm install
```
# Запуск сервера
```bash
npm run dev
```
# Сборка
```bash
npm run build
```
# Превью сборки
```bash
npm run preview
```

## Данные для демо-доступа
user@example.com user123
admin@example.com admin123
