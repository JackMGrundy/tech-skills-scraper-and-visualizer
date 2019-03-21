#!/bin/bash

# Start the primary process and put it in the background
exec tor -f /etc/tor/torrc.default &

exec celery -A tasks worker --pool=gevent --concurrency=20 --loglevel=INFO

# &

# exec echo "need to fix python"
# exec python3 /hw.py

fg %1