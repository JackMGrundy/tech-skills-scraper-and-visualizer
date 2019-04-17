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
import time
from random import choice

from indeedScraping.util.userAgents import userAgents
from indeedScraping.util.helpers import uniqueItems, extractHTML, jsonSave, formatDateForMongo, replaceDict, match_class, sleepTimes

from indeedScraping.extractJobInfo import batchExtractJobInfo
from indeedScraping.extractJobKeys import batchExtractMatches

import sys

@app.task(bind=True, name="scrape")
def testTask(self, jobId):
    print("Starting job: ", jobId)

    scraperTaskDetails = ScraperTask.objects(pk=ObjectId(jobId))[0]
    print("DETAILS:", scraperTaskDetails)
    jobTitle, jobAliases, skills = scraperTaskDetails.jobTitle, scraperTaskDetails.jobAliases, scraperTaskDetails.skills
    active, username, taskName, cities = scraperTaskDetails.active, scraperTaskDetails.username, scraperTaskDetails.taskName, scraperTaskDetails.selectedCities
    # print("Task details: ", jobTitle, jobAliases, skills, active, username, taskName)


    # Format variables for scraping
    searchTerms = [jobTitle] + [ x for x in jobAliases if x != '']
    # print("searchTerms: ", searchTerms)

    os.environ["JOB_KEYS_REGEX"] = "jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \="

    jobKeys = []
    jobs = []
    TOR_ON = os.environ['TOR_ON']=='True'
    PAGES_PER_SCRAPE = int(os.environ['PAGES_PER_SCRAPE'])
    SLEEP_TIME_POST_TASK = int(os.environ['SLEEP_TIME_POST_TASK'])
    completedEndPoint = "http://backend:8080/api/v1/scrapertask"

    if os.environ['SCRAPING_ON']=='True':
        try:
            # Extract job keys (Indeed's unique identifiers for job posts)
            for searchTerm in searchTerms:
                # print("WORKING ON SEARCH TERM: ", searchTerm)
                jobKeys += batchExtractMatches(numPages=PAGES_PER_SCRAPE, searchTerm=searchTerm, searchRegexEx=os.environ['JOB_KEYS_REGEX'], cities=cities,
                                tor=TOR_ON, port=9051, matchSingleWriteLocation=None, userAgent=None, sleepTime=int(os.environ['SLEEP_TIME']), htmlWriteLocations=None, 
                                matchWriteLocations=None, pageIncrements=10)
                print("JOB KEYS ARE NOW: ", jobKeys)
            
            # Remove job keys for jobs that have already been scraped
            duplicateJobs = JobPost.objects(jobkey__in=jobKeys)
            duplicateJobs = [ job.jobkey for job in duplicateJobs ]
            print("Removing jobkeys that have already been scraped: {}".format(duplicateJobs))
            finalKeys = []
            for key in jobKeys:
                if key not in duplicateJobs:
                    finalKeys.append(key)
            print("Final list of jobkeys to scrape: {}".format(finalKeys))


            # Extract info associated with each job key
            technologies = { x[0]:x for x in skills }
            jobs = batchExtractJobInfo(jobkeys=finalKeys, replaceDict=replaceDict, technologies=technologies, sleepTime=int(os.environ['SLEEP_TIME']), tor=TOR_ON, port=9051)
            print("Extracted info for {} jobs".format(len(jobs)))
            if jobs:
                print("First job extracted: ", jobs[0])
            
            # Insert to DB
            for job in jobs:
                nextJob = createJobPost(scraperTaskId=jobId, posted=job['posted'], city=job['city'], 
                                        state=job['state'], technologies=job['technologies'], jobkey=job['jobkey'], 
                                        taskName=taskName, username=username, title=job['title'], company=job['company'], 
                                        experience=job['experience'])
                nextJob.save()
        except:
            # Notify backend
            print("Unexpected error:", sys.exc_info()[0])
            requests.post(completedEndPoint, json={"jobId": jobId, "status": "failed", "error": sys.exc_info()[0]})

    else:
        print("SCRAPING SWITCHED OFF")

    # Additional sleep time before reporting back
    time.sleep(choice([SLEEP_TIME_POST_TASK]))

    # Notify backend
    requests.post(completedEndPoint, json={"jobId": jobId, "numNewPosts": len(jobs), "status": "success", "error": "None"})
# EOF