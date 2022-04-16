FROM node:16.14.0
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
EXPOSE 3000
RUN npm install --force
CMD npm run start
