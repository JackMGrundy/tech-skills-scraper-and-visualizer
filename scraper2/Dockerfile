# # Start with alpine linux distro
FROM alpine:latest

# Install tor
RUN apk update && apk add \
    tor \
    --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
    && rm -rf /var/cache/apk/*

# Install GCC
RUN apk add build-base

# Install python 3
RUN apk add --no-cache python3 && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi && \
    rm -r /root/.cache

# Install python dev
RUN apk add python3-dev

# Install python dependencies
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 PYTHONUNBUFFERED=1

WORKDIR /

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN rm requirements.txt

COPY . /

# Set up for local tor proxy
EXPOSE 9050
COPY torrc.default /etc/tor/torrc.default

# Execute starter script
COPY starter-script.sh ./
RUN chmod 777 starter-script.sh
RUN ls -a
CMD /bin/sh  ./starter-script.sh

# WORKDIR /




# Original
# FROM python:3.6.6

# ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 PYTHONUNBUFFERED=1

# WORKDIR /

# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
# RUN rm requirements.txt

# COPY . /
# WORKDIR /scraper