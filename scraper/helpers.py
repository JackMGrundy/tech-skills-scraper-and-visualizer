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
import logging
from datetime import datetime, timedelta

def uniqueItems(lst):
	temp = set(lst)
	return(list(temp))


def extractHTML(url, userAgent, writeLocation=None, prettify=True):
	"""

	Args:
	    url: url to retrieve html from 
	    userAgent: userAgent to specify in headers
	    writeLocation: if specified, complete location where to store html scraped

	Returns:
	    The scraped html

	"""
	# Request
	if not userAgent:
		ua = random.choice(userAgents)
		logging.info("Using user agent: " + str(ua))
	else:
		ua = userAgent

	headers = { "User-Agent":  ua}
	r = requests.get(url, headers=headers)
	soup = BeautifulSoup(r.text, 'html.parser')

	if prettify:
		soup = pretty(soup)

	# Store if indicated
	if writeLocation:
		jsonSave(soup, writeLocation)

	return(soup)


def pretty(soup):
	soup = soup.prettify()
	# Don't care about non ascii
	soup = ''.join([i if ord(i) < 128 else ' ' for i in soup])	
	return soup

def match_class(target):                                                        
    def do_match(tag): 
    	"""

	Get html content by class

	"""                                                         
        classes = tag.get('class', [])                                          
        return all(c in classes for c in target)                                
    return do_match  



def jsonSave(data, writeLocation):
	"""
	Saves json list data. If the writeLocation file already exists, loads the previous json, appends the new data, and then writes

	Args:
		data: data to write to a file
	    writeLocation: location to write json to

	Returns:
	    combined matches 

	"""
	# if file already exists, append
	if os.path.isfile(writeLocation):
		logging.info("Adding new matches to: " + str(writeLocation))
		with open(writeLocation, "r") as f:
			oldMatches = set(json.load(f))
		newMatches = set(data)
		data = oldMatches | newMatches
		data = list(data)
		encodedMatches = json.dumps(data)
		logging.info("Old matches: " + str(oldMatches))
		logging.info("New matches: " + str(newMatches))
		logging.info("Combined matches: " + str(data))

		with open(writeLocation, "w+") as f:
			f.write(encodedMatches)
	else:
		logging.info("Writing matches to new file: " + str(writeLocation))
		with open(writeLocation, "w+") as f:
			encodedMatches = json.dumps(data)
			f.write(encodedMatches)		

	return data


replaceDict = {
				"(" : " ",
				")" : " ",
				"/" : " ",
				"," : " ",
				"<" : " ",
				">" : " ",
				"\\n" : " ",
				"\\s" : " ",
				"\\t" : " ",
				"\\": " "
				}


def formatDateForMongo(date):
	""" 

	Args:
		date: date string of the format YYYY-MM-DD


	Returns: 
		MongoDb requires isodates. Returns a string in a format that will play nice with Mongo upon upload. 	

	"""
	if date:
		timeStamp = time.mktime(datetime.strptime(date, "%Y-%m-%d").timetuple())
		isodate = datetime.fromtimestamp(timeStamp, None)
		return(isodate)
	else:
		return None



sleepTimes = [1, .75, 1.25, .8, 1.2]


userAgents = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (X11; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (iPad; CPU OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
			'Mozilla/5.0 (Windows NT 6.1; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0',
			'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0',
			'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
			'Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0',
			'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/70.0.3538.77 Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
			'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
			'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36 OPR/56.0.3051.99',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
			'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:63.0) Gecko/20100101 Firefox/63.0'
			]

technologies = { "amazon machine learning": ["amazon machine learning"],
				"apache giraph": ["apache giraph"],
				"artificial intelligence": ["artificial intelligence", " ai "],
				"autoenoder": ["autoenoder"],
				"awk": [" awk "],
				"aws": [" aws ", "amazon web services"],
				"azure": ["azure"],
				"bash": ["bash"],
				"bayesian statistics": ["bayesian statistics"],
				"boto3": ["boto3"],
				"c": [" c "],
				"c++": ["c++"],
				"caffe": [" caffe "],
				"cassandra": ["cassandra"],
				"classification": ["classification"],
				"clojure": ["clojure"],
				"cloudera": ["cloudera"],
				"clustering": ["clustering"],
				"cnn": [" cnn "],
				"d3.js": [" d3 "],
				"data mining": ["data mining"],
				"databricks": ["databricks"],
				"decision trees": ["decision trees"],
				"deep learning": ["deep learning", " dl ", "deep-learning"],
				"elasticsearch": ["elasticsearch", "elastic search"],
				"emcee": ["emcee"],
				"excel": ["excel"],
				"flask": ["flask"],
				"flume": ["flume"],
				"fortran": ["fortran"],
				"ggplot2": ["ggplot2"],
				"git": [" git "],
				"hadoop": ["hadoop"],
				"hbase": ["hbase"],
				"hive": [" hive "],
				"impala": ["impala"],
				"java": [" java "],
				"javascript": ["javascript"],
				"jmp": ["jmp"],
				"julia": ["julia"],
				"jupyter": ["jupyter"],
				"kafka": ["kafka"],
				"k-means": ["k-means"],
				"knn": [" knn ", " k-nn "],
				"keras": ["keras"],
				"linear regression": ["linear regression", "regression"],
				"logistic regression": ["logistic regression"],
				"lstm": ["lstm"],
				"machine learning": ["machine learning", " ml "],
				"mahout": ["mahout"],
				"matlab": ["matlab"],
				"matplotlib": ["matplotlib"],
				"minitab": ["minitab"],
				"mixture models": ["mixture models", "gaussian mixtures"],
				"mongodb": ["mongodb"],
				"mysql": ["mysql"],
				"naive bayes": ["naive bayes"],
				"networkx": ["networkx"],
				"neural networks": ["neural networks"],
				"nlp": ["nlp", "natural language processing"],
				"nltk": ["nltk"],
				"nosql": ["nosql"],
				"numpy": ["numpy"],
				"objective-c": ["objective-c"],
				"opencv": ["opencv"],
				"oracle": ["oracle"],
				"orange": ["orange"],
				"pandas": ["pandas"],
				"dimensionality reduction": [" pca ", "dimensionality reduction"],
				"perl": ["perl"],
				"php": ["php"],
				"pig": [" pig "],
				"postgresql": ["postgresql"],
				"presto": ["presto"],
				"pycopg2": ["pycopg2"],
				"pyspark": ["pyspark"],
				"python": [" python "],
				"pytorch": ["pytorch, torch"],
				"qlickview": ["qlickview"],
				"r": [" r "],
				"random forest": ["random forest", "decision forests"],
				"redis": ["redis"],
				"redshift": ["redshift"],
				"reinforcement learning": ["reinforcement learning", " rl '"],
				"rnn": ["rnn"],
				"ruby": ["ruby"],
				"sas": [" sas "],
				"scala": ["scala"],
				"sklearn": ["sci-kit", "scikit", "sklearn"],
				"scipy": ["scipy"],
				"sed": [" sed "],
				"shark": ["shark"],
				"shiny": ["shiny"],
				"spark": ["spark"],
				"spss": ["spss"],
				"sql": [" sql ", "relational databases"],
				"stan": [" stan "],
				"stata": ["stata"],
				"svm": ["svm", "support vector machines"],
				"tableau": ["tableau"],
				"tensorflow": ["tensorflow"],
				"theano": ["theano"],
				"unsupervised learning": ["unsupervised learning"],
				"visualization": ["visualization"]
				}


degrees = { "phd": ["phd", "ph.d.", "doctoral degree"],
			"masters": ["masters", "master's", " master ", " ms ", "graduate", "advanced degree", " m.s. "],
			"bachelors": ["bachelor", "bachelor's", " b.s ", " b.a ", " bs ", "bachelors", "undergraduate"]
			}
# EOF