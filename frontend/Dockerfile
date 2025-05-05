FROM node:20-alpine AS development

WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Start development server with hot reload
EXPOSE 3000
CMD ["npm", "start"]

# Production build stage
FROM development AS build
RUN npm run build

# Production environment stage
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]