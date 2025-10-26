FROM nginx:alpine

# Remove the default nginx configuration that conflicts with ours
RUN rm /etc/nginx/conf.d/default.conf

# Create snippets directory
RUN mkdir -p /etc/nginx/snippets

# Copy our nginx configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/prod.conf /etc/nginx/conf.d/prod.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY snippets/cors-prod.conf /etc/nginx/snippets/cors-prod.conf
COPY snippets/security-prod.conf /etc/nginx/snippets/security-prod.conf

# Expose port 80
EXPOSE 80

# Start nginx (configuration will be tested at runtime when hostnames are available)
CMD ["nginx", "-g", "daemon off;"]