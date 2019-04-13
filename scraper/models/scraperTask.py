import datetime
import os
from mongoengine import *

# Connect to db
connect(os.environ["DATABASE_NAME"], host='mongo', port=int(os.environ["DB_PORT"]) ) 

class ScraperTask(Document):
    meta = {
        'collection': 'scraper_task'
    }

    jobTitle = StringField()
    taskName = StringField()
    jobAliases = StringField()
    skills = ListField()
    active = BooleanField()
    username = StringField()
    created = StringField()
    lastScraped = StringField()
    totalJobsScraped = IntField()
    totalScrapes = IntField()
    queued = BooleanField()
    maxRetries = IntField()
    error = StringField()
    selectedCities = ListField()