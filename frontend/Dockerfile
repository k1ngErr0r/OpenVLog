# Use a Node.js base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Use a lightweight image to serve the application
FROM node:18-alpine AS production

# Set the working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Copy package.json and node_modules for serve
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Expose the port the app will run on
EXPOSE 5173

# Command to run the application
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
