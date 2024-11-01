# Medical Staff Patient Care Assessment
This app aims to help nurses at evaluating and documenting the time patient care takes
according to the PPBV ("Pflegepersonalbemessungsverordnung").

## Features
The list of features

## Getting Started
```
pip install -r requirements.txt
python manage.py runserver
```

## Docker
Before running the following commands, install [Docker](https://www.docker.com/).
Also create the .env file (see sample.env for required fields).
```
docker-compose build
docker-compose up
```

## Linting

We use flake for linting. Run it with

```
flake8 .
```

If you use a virtual environment, please use the flake command specified in the `Scripts` folder in the `venv` folder.

## Documentation
TODO Link documentation here