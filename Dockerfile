# Etapa 1: Construir a aplicação React
# Usamos a imagem 'slim' que é mais robusta para evitar erros de "comando não encontrado"
FROM node:18-slim AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os ficheiros de manifesto primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto dos ficheiros da aplicação
COPY . .

# Define a variável de ambiente para aumentar a memória do Node.js durante o build
ENV NODE_OPTIONS=--max-old-space-size=4096

# Executa o build
RUN npm run build

# ---

# Etapa 2: Servir a aplicação com Nginx
FROM nginx:1.25-alpine

# Copia os ficheiros estáticos da etapa de build para o diretório web do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração personalizada para o Nginx
COPY nginx.conf /etc/nginx/conf.d

# Expõe a porta 80 para o tráfego de entrada
EXPOSE 80

# Comando para iniciar o servidor Nginx quando o contentor arrancar
CMD ["nginx", "-g", "daemon off;"]