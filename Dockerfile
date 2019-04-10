FROM node:8
WORKDIR /main
COPY package.json /main
RUN npm install -g nodemon
COPY . /main
CMD [ "nodemon", "start" ]
EXPOSE 3000