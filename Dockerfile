FROM vlegm/dev-alpine:latest

WORKDIR /mnt/host
COPY . .
RUN yarn install

WORKDIR /mnt/host/src
