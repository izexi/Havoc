FROM node:12-alpine

ENV TOKEN= \
	PREFIX=

RUN mkdir -p /usr/src/havoc
WORKDIR /usr/src/havoc
COPY package.json /usr/src/havoc/

RUN apk add --update \
  && apk add --no-cache git g++ make python \
  && npm i

COPY . /usr/src/havoc

EXPOSE 3000

CMD ["npm", "start"]