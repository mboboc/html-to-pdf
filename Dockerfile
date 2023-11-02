FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /usr/src/app

USER root

RUN mkdir node_modules && chown pptruser:pptruser node_modules

COPY --chown=pptruser:pptruser package*.json ./

USER pptruser

RUN npm install

EXPOSE 3006

# Start the app
CMD ["npm", "start"]
