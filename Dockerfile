FROM node
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
COPY .env ./
EXPOSE 5000
CMD ["npm", "run", "dev"]

