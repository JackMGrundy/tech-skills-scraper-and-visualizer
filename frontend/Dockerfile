# base image
FROM node:9.6.1

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# ENV NODE_ENV development

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install react-scripts@1.1.1 -g
COPY public /usr/src/app/public
COPY src /usr/src/app/src
COPY .env.development /usr/src/app/.env.development

# start app
RUN npm install @material-ui/core
RUN npm install @material-ui/icons

CMD ["npm", "start"]