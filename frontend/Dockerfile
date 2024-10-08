# frontend/Dockerfile
FROM nginx:alpine

# Удаляем стандартный index.html, если он есть
RUN rm /usr/share/nginx/html/index.html

# Копируем все файлы фронтенда в директорию Nginx
COPY . /usr/share/nginx/html

# Копируем конфигурационный файл Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Запуск Nginx в переднем плане
CMD ["nginx", "-g", "daemon off;"]
