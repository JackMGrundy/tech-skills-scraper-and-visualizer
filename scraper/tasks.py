import os

from io import BytesIO
from urllib.parse import urlparse
from celery.utils.log import get_task_logger
from worker import app

import requests

from pymongo import MongoClient
from random import randint
import pprint

# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient("mongodb://mongo:27017/testDB")
db=client.testDB


logger = get_task_logger(__name__)


@app.task(bind=True, name="tasks")
def testTask(self, a):
    print("ay")
    session = requests.session()
    session.proxies = {}

    r = session.get('http://httpbin.org/ip')
    print(r.text)

    # Socks protocol / connect to tor agent
    session.proxies['http'] = 'socks5h://localhost:9051'
    session.proxies['https'] = 'socks5h://localhost:9051'

    # Headers
    headers = {}
    headers['User-agent'] = "HotJava/1.1.2 FCS"


    r = session.get('http://httpbin.org/ip')
    print(r.text)



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