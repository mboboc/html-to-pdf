# Printer service

A headless browser in a Docker container that can login to a platform
and print any URL to a PDF.
It loads credentials for the _platform_ user from environment variables.

## Setup
The container can be built and started from the project's main
`docker-compose.yml` or standalone with the following commands:

```shell
docker build -t printer .
docker run -d --name printer --restart unless-stopped -p 3000:3000 printer
```

## API
* `GET /pdf` - Check if the service is up.
* `POST /pdf?url={url}` – Open `url` in Chrome, log in, and print to PDF.
The PDF is returned in the response body.
