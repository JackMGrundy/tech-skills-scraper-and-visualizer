from pymongo import MongoClient
from bs4 import BeautifulSoup
import urllib2
import re
import requests
import random
import time
import json
import os
import sys
import argparse
import traceback
from helpers import *
from extractJobKeys import *
from extractJobInfo import *
import logging
from datetime import datetime, timedelta

# Scrape new keys
scrapedKeys = batchExtractMatches(numPages=5, searchTerm="data scientist", searchRegexEx="jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \=")
logging.info("Scraped keys: " + str(scrapedKeys))

# Compare with current keys in the database to get list of new keys
client = MongoClient()
db = client.INDEED
jobposts = db.jobposts
currentKeys = jobposts.distinct("link")
logging.info("Current keys in INDEED database: " + str(currentKeys))

newKeys = list( set(scrapedKeys) - set(currentKeys) )
logging.info("New keys: " + str(newKeys))

# Scrape info for the new keys
info = batchExtractJobInfo(jobkeys=newKeys, replaceDict=replaceDict)
logging.info("Extracted info: " + str(info))

# Update to MongoDB
result = jobposts.insert_many(info)
logging.info("Number of records inserted to database: " + str(len(result.inserted_ids)))
logging.info("Inserted ids:\n" + str(result.inserted_ids))
# EOF