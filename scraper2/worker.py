import os
from celery import Celery

app = Celery('tasks', broker=os.environ['CELERY_BROKER_URL'])

@app.task(bind=True, name="task")
def add(self, a):
    print(a, "olllddd")
