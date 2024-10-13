# Use an official Node.js image as the base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json ./
COPY package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight web server to serve the build (nginx)
FROM nginx:alpine

# Copy the React build files from the previous stage to the nginx public directory
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80 to access the container
EXPOSE 80

# Start nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
