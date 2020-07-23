FROM node:13.13-stretch
WORKDIR /home/tools
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3030
CMD [ "node", "index.js" ]
