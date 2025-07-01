# Etapa 1: Construir a aplicação React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./

# Usa npm install para ser mais flexível
RUN npm install

COPY . .

# Adiciona explicitamente o caminho dos binários ao PATH
ENV PATH /app/node_modules/.bin:$PATH

# Executa o build
RUN npm run build

# Etapa 2: Servir a aplicação com Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
