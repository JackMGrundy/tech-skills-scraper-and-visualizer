FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY package*.json ./

# VOLUME [ "/usr/src/app" ]

# RUN npm install
# RUN npm install -g nodemon

# For production
# RUN npm ci --only=production

# Bundle app source
COPY . .
# RUN ls
RUN npm install
# RUN npm install express-async-errors  --save
# RUN npm list --depth=0

# CMD [ "nodemon", "-L", "app.js" ]
CMD [ "node", "app.js" ]