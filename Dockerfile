FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Opción para desarrollo:
CMD ["npm", "run", "dev"]
