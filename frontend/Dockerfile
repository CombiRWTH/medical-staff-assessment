# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY . .

RUN npm install

# Remove package.json and package-lock.json
RUN npm run build

# Expose port 3000 for Next.js
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
