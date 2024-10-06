# frontend/Dockerfile
FROM nginx:alpine

# Копирование статического HTML-файла в директорию Nginx
COPY index.html /usr/share/nginx/html/index.html

# Копирование конфигурационного файла Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Запуск Nginx в переднем плане
CMD ["nginx", "-g", "daemon off;"]