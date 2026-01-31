FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar pasta de uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
