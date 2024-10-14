# frontend/Dockerfile

# Этап сборки
FROM node:14-alpine AS build
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходный код
COPY . ./

# Передаём переменную окружения для API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Сборка React приложения
RUN npm run build

# Этап продакшена
FROM nginx:alpine

# Копируем собранное приложение в директорию nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Указываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
