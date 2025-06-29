# Etapa 1: Construir a aplicação React
# Usamos uma imagem oficial do Node.js como base
FROM node:18-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os ficheiros de manifesto. O lockfile é essencial para o npm ci.
COPY package*.json ./

# Instala as dependências de forma limpa
RUN npm ci

# Copia o resto do código fonte da aplicação
COPY . .

# CORREÇÃO CRUCIAL: Usa a sintaxe key="value" para o ENV PATH
# Isto garante que o caminho para os executáveis npm seja encontrado.
ENV PATH="/app/node_modules/.bin:${PATH}"

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

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]