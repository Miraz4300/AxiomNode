# Axiom-Node
FROM node:lts-alpine as backend
RUN npm install pnpm -g
WORKDIR /app
COPY /infrastructure/package.json /app
COPY /infrastructure/pnpm-lock.yaml /app
RUN pnpm install
COPY /infrastructure /app
RUN pnpm build

# Axiom-Node | Infrastructure
FROM node:lts-alpine
RUN npm install pnpm -g
WORKDIR /app
COPY /infrastructure/package.json /app
COPY /infrastructure/pnpm-lock.yaml /app
RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*
COPY /infrastructure /app
COPY --from=backend /app/build /app/build
EXPOSE 10829

CMD ["pnpm", "run", "prod"]
