# GoogleAdSenseSeeds
A lite site that can load Google AdSense and serve as a simple page site.

- Reusable social share module is available on the homepage and can be embedded into future pages.

## Docker Usage

### 1) Build image

```bash
docker build -t google-adsense-seeds:test .
```

### 2) Run container

```bash
docker run --rm -p 3000:3000 --env-file .env google-adsense-seeds:test
```

Open http://localhost:3000 after startup.

### 3) Open shell in container

This image is based on Alpine, so use `sh` instead of `bash`.

```bash
docker run -it --entrypoint /bin/sh google-adsense-seeds:test
```

### 4) Use docker compose

```bash
docker compose up --build
```

Stop and remove containers:

```bash
docker compose down
```
