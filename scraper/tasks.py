import os

from io import BytesIO
from urllib.parse import urlparse
from celery.utils.log import get_task_logger
from worker import app

import requests

from pymongo import MongoClient
from bson.objectid import ObjectId

from indeedScraping.util.userAgents import userAgents
from indeedScraping.util.helpers import uniqueItems, extractHTML, jsonSave, formatDateForMongo, replaceDict, match_class, sleepTimes

from indeedScraping.extractJobInfo import batchExtractJobInfo
from indeedScraping.extractJobKeys import batchExtractMatches


# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient("mongodb://mongo:27017/" + os.environ["DATABASE_NAME"])
db=client[ os.environ["DATABASE_NAME"] ]


logger = get_task_logger(__name__)


@app.task(bind=True, name="scrape")
def testTask(self, jobId):
    print("Starting job: ", jobId)
    # db.jobs.insert_one( {"a": "this is a test"})
    # print("jobId: ", jobId)
    print("Retrieving info from mongo")
    jobDetails = db.jobs.find_one({'_id': ObjectId(jobId)})
    print("Job details: ", jobDetails)
    jobTitle, jobAliases, skills, active = jobDetails['jobTitle'], jobDetails['jobAliases'], jobDetails['skills'], jobDetails['active']
    print("Retrieved", jobTitle, jobAliases, skills, active)


    # Extract jobKeys
    print("extracting info")

    # Format variables for scraping
    searchTerms = [jobTitle] + [ x for x in jobAliases if x != '']

    jobKeys = []
    for searchTerm in searchTerms:
        jobKeys += batchExtractMatches(numPages=1, searchTerm=searchTerm, searchRegexEx="jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \=", 
                    tor=True, port=9051, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, htmlWriteLocations=None, 
					matchWriteLocations=None, pageIncrements=10)
    
    print(jobKeys)
    technologies = { x[0]:x[1:] for x in skills }
    print(technologies)
    jobs = batchExtractJobInfo(jobkeys=jobKeys[:2], replaceDict=replaceDict, technologies=technologies, tor=True, port=9051)
    print(jobs)
    

    


    # print("completing task with jobId: ", jobId)


    # session = requests.session()
    # session.proxies = {}

    # r = session.get('http://httpbin.org/ip')
    # print(r.text)

    # Connect to node backend...
    # r = session.get("http://backend:8080/pyTest")
    # print(r.text)

    # Socks protocol / connect to tor agent
    # session.proxies['http'] = 'socks5h://localhost:9051'
    # session.proxies['https'] = 'socks5h://localhost:9051'

    # Headers
    # headers = {}
    # headers['User-agent'] = "HotJava/1.1.2 FCS"


    # r = session.get('http://httpbin.org/ip')
    # print(r.text)





    # session = requests.session()
    # r=session.get('https://www.nytimes.com/')
    # print(r.headers)
    #Step 2: Create sample data
    # names = ['Kitchen','Animal','State', 'Tastey', 'Big','City','Fish', 'Pizza','Goat', 'Salty','Sandwich','Lazy', 'Fun']
    # company_type = ['LLC','Inc','Company','Corporation']
    # company_cuisine = ['Pizza', 'Bar Food', 'Fast Food', 'Italian', 'Mexican', 'American', 'Sushi Bar', 'Vegetarian']
    # for x in range(1, 10):
    #     business = {
    #         'name' : names[randint(0, (len(names)-1))] + ' ' + names[randint(0, (len(names)-1))]  + ' ' + company_type[randint(0, (len(company_type)-1))],
    #         'rating' : randint(1, 5),
    #         'cuisine' : company_cuisine[randint(0, (len(company_cuisine)-1))] 
    #     }
    #     #Step 3: Insert business object directly into MongoDB via isnert_one
    #     result=db.reviews.insert_one(business)
    #     #Step 4: Print to the console the ObjectID of the new document
    #     print('Created {0} of 500 as {1}'.format(x,result.inserted_id))

    #     print("AYYYYYYYYYYYYYOOOOOOOOOOOOOOO\n\n\n\n\n\n")
    #     fivestarcount = db.reviews.find_one()
    #     pprint.pprint(fivestarcount)