import os

from io import BytesIO
from urllib.parse import urlparse
from celery.utils.log import get_task_logger
from worker import app

import requests

# from pymongo import MongoClient
from bson.objectid import ObjectId
from mongoengine import *
from models.scraperTask import ScraperTask
from models.jobPost import JobPost, createJobPost
import datetime

from indeedScraping.util.userAgents import userAgents
from indeedScraping.util.helpers import uniqueItems, extractHTML, jsonSave, formatDateForMongo, replaceDict, match_class, sleepTimes

from indeedScraping.extractJobInfo import batchExtractJobInfo
from indeedScraping.extractJobKeys import batchExtractMatches

import sys

@app.task(bind=True, name="scrape")
def testTask(self, jobId):
    print("Starting job: ", jobId)

    scraperTaskDetails = ScraperTask.objects(pk=ObjectId(jobId))[0]
    jobTitle, jobAliases, skills = scraperTaskDetails.jobTitle, scraperTaskDetails.jobAliases, scraperTaskDetails.skills
    active, username, taskName = scraperTaskDetails.active, scraperTaskDetails.username, scraperTaskDetails.taskName
    print("Retrieved", jobTitle, jobAliases, skills, active, username, taskName)

    # Extract jobKeys
    print("extracting info")

    # Format variables for scraping
    searchTerms = [jobTitle] + [ x for x in jobAliases if x != '']
    print("searchTerms: ", searchTerms)

    print("REGEX VAR: ", os.environ["JOB_KEYS_REGEX"])
    os.environ["JOB_KEYS_REGEX"] = "jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \="

    jobKeys = []
    if os.environ['SCRAPING_ON']=='True':
        for searchTerm in searchTerms:
            print("WORKING ON SEARCH TERM: ", searchTerm)
            jobKeys += batchExtractMatches(numPages=5, searchTerm=searchTerm, searchRegexEx=os.environ['JOB_KEYS_REGEX'], 
                            tor=False, port=9051, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, htmlWriteLocations=None, 
                            matchWriteLocations=None, pageIncrements=10)
            print("JOB KEYS ARE NOW: ", jobKeys)

        technologies = { x[0]:x for x in skills }
        print("technologies: ", technologies)
        jobs = batchExtractJobInfo(jobkeys=jobKeys, replaceDict=replaceDict, technologies=technologies, tor=False, port=9051)
        print("First job extracted: ", jobs[0])
        
        # Insert to DB
        for job in jobs:
            nextJob = createJobPost(scraperTaskId=jobId, posted=job['posted'], city=job['city'], 
                                    state=job['state'], technologies=job['technologies'], jobkey=job['jobkey'], 
                                    taskName=taskName, username=username)
            nextJob.save()
    else:
        print("SCRAPING SWITCHED OFF")

    # Notify backend
    completedEndPoint = "http://backend:8080/api/scraper/jobCompleted"
    requests.post(completedEndPoint, json={"jobId": jobId, "status": "completed"})
# EOF