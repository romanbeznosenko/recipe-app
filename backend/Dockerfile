FROM python:3.12-slim

WORKDIR /app

# Install system dependencies including MySQL client
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file (if you have one)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make startup script executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port for the FastAPI application
EXPOSE 8000

# Run startup script which waits for MySQL, initializes DB, and starts the app
CMD ["/start.sh"]