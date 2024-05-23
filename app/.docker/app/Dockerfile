FROM registry.access.redhat.com/ubi8/nodejs-20-minimal:1-41.1712567743
ARG USER=1001
USER $USER
ENV HOME=/opt/app-root/src
ENV NPM_CONFIG_CACHE=/opt/app-root/npm_cache

RUN mkdir -p $HOME && mkdir -p $NPM_CONFIG_CACHE

WORKDIR $HOME

# Copy the package files only
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY --chown=$USER --chmod=777 package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

# Copy the rest of the files
COPY --chown=$USER . ./

VOLUME ${HOME}

# start app with live reload
CMD ["npm", "run", "start"]
