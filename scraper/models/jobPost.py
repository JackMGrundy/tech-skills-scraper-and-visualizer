import datetime
import os
from mongoengine import *

# Connect to db
connect(os.environ["DATABASE_NAME"], host='mongo', port=int(os.environ["DB_PORT"]) ) 

class JobPost(Document):
    posted = DateTimeField()
    scraperTaskId = StringField(required=True, max_length=200)
    city = StringField(required=True, max_length=200)
    state = StringField(required=True, max_length=2)
    technologies = ListField()
    jobkey = StringField(required=True, max_length=200)
    taskName = StringField(required=True, max_length=200)
    username = StringField(required=True, max_length=200)
    title = StringField(required=False, max_length=200)
    company = StringField(required=False, max_length=200)
    experience = StringField(required=False, max_length=200)


def createJobPost(scraperTaskId, posted, city, state, technologies, jobkey, taskName, username, title, company, experience):
    return (
        JobPost(
            scraperTaskId = scraperTaskId,
            posted = posted,
            city = city,
            state = state,
            technologies = technologies,
            jobkey = jobkey,
            taskName = taskName,
            username = username,
            title = title,
            company = company,
            experience = experience
        )
    )
# EOF