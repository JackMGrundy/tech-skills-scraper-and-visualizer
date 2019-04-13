#!/bin/bash

# Start the primary process and put it in the background
exec tor -f /etc/tor/torrc.default &

exec celery -A tasks worker --pool=gevent --concurrency=10 --loglevel=INFO
# exec celery -A tasks worker --pool=gevent --concurrency=5 --scale worker=15 --loglevel=INFO

fg %1