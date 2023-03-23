# AxiomNode Build
FROM node:lts-alpine
WORKDIR /app
COPY package.json /app
COPY pnpm-lock.yaml /app
RUN npm install pnpm -g
RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*
COPY . . /app/

EXPOSE 10829
CMD ["pnpm", "run", "prod"]
