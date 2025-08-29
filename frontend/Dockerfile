# Stage 1: Build the React application
ARG VITE_API_BASE_URL
FROM node:20-alpine AS build

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (clean, deterministic)
RUN npm ci --no-audit --no-fund

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
