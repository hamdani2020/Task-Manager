# Stage 1: Build the React app
FROM node:16-alpine as Build

WORKDIR /app


# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source files and Build
COPY . ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build from stage 1
COPY --from=build /app/build/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
