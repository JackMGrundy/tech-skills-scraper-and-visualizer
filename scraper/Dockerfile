# # Start with alpine linux distro
FROM alpine:latest

# Install tor
RUN apk update && apk add \
    tor \
    --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
    && rm -rf /var/cache/apk/*

# Install python 3
RUN apk add --no-cache --virtual .build-deps g++ python3-dev libffi-dev openssl-dev && \
    apk add --no-cache --update python3 && \
    pip3 install --upgrade pip setuptools

# Install python dependencies
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 PYTHONUNBUFFERED=1

WORKDIR /

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN rm requirements.txt

COPY . /

# Set up for local tor proxy
EXPOSE 9051
COPY torrc.default /etc/tor/torrc.default

# Execute starter script
COPY starter-script.sh ./
RUN chmod 777 starter-script.sh
CMD /bin/sh  ./starter-script.sh