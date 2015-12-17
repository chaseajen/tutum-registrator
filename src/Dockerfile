FROM node

COPY . /src

WORKDIR /src
RUN npm config set loglevel win
RUN npm install

CMD ["node", "program"]