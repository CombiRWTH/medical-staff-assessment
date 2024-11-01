#!/bin/bash

# Create the database
echo 'Make migrations'
python /app/manage.py makemigrations
python /app/manage.py migrate

# Create superuser
echo 'Create superuser'
python /app/manage.py createsuperuser --noinput # noinput flag to use environment variables

# Fill database with questions from the PPBV
echo 'Fill database with questions from the PPBV'
python /app/manage.py loaddata /app/backend/fixtures/questions.json

# Run server on PORT 8000
python /app/manage.py runserver 0.0.0.0:8000


