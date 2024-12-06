# Stage 1: Install dependencies and build the application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only the package files to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
