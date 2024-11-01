# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Copy requirements.txt first to install dependencies before copying the rest of the app
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install dos2unix
RUN apt-get update && apt-get install -y dos2unix

# Copy the Django project files
COPY . .

# Expose the port the app runs on (default Django port is 8000)
EXPOSE 8000

# Create a startup script
COPY start.sh /start.sh
RUN dos2unix /start.sh
RUN chmod +x /start.sh

# Set the startup script as the entry point
ENTRYPOINT ["/start.sh"]

