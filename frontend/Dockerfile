# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install

# Remove package.json and package-lock.json
RUN rm -f package*.json

# Copy the rest of the app
# COPY . .

# Build the Next.js app
# RUN npm run build

# Expose port 3000 for Next.js
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "dev"]
