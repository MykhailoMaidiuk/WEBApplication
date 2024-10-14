# frontend/Dockerfile

# Build Stage
FROM node:14-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

# Production Stage
FROM node:14-alpine
RUN npm install -g http-server
WORKDIR /app
COPY --from=build /app/build /app/build
EXPOSE 3009
CMD ["http-server", "build", "-p", "3009"]