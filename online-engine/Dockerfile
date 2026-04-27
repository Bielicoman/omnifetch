FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates curl \
  && python3 -m pip install --break-system-packages --no-cache-dir yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY online-engine/package*.json ./
RUN npm install --omit=dev

COPY online-engine ./online-engine
COPY site ./site
WORKDIR /app/online-engine

ENV PORT=8787
ENV OMNIFETCH_SITE_DIR=/app/site
ENV OMNIFETCH_STORAGE=/app/online-engine/storage
ENV YT_DLP_PATH=yt-dlp
ENV FFMPEG_PATH=ffmpeg

EXPOSE 8787
CMD ["npm", "start"]
