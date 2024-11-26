# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install dependencies from requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install packages for database check
RUN apt-get update && apt-get install -y dos2unix netcat-openbsd postgresql-client

# Copy Django project files into working directory of container
COPY . .

# Expose the port the app runs on
EXPOSE $WEB_PORT

# Create startup script and set it as enrtypoint
COPY start.sh /start.sh
RUN dos2unix /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
