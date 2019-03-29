from bs4 import BeautifulSoup
import urllib3
import re
import requests
import random
import time
import json
import os
import sys
import argparse
import traceback
import requests
# import logging
from indeedScraping.util.userAgents import userAgents
from datetime import datetime, timedelta

def uniqueItems(lst):
	return(list(set(lst)))


def enableTor(port):
	"""

	Args:
		port (int): port that tor is listening to 

	Returns:
		session: a session object with proxies for http and https pointing to tor. Note, 

	"""
	session = requests.session()
	session.proxies = {}

	# Socks protocol / connect to tor agent
	session.proxies['http'] = 'socks5h://localhost:{}'.format(port)
	session.proxies['https'] = 'socks5h://localhost:{}'.format(port)


	r = session.get('http://httpbin.org/ip')
	print( "Initialized tor. Sending requests from port: {} and ip: {}".format(port, r.text) )

	return session


def extractHTML(url, userAgent=None, tor=False, port=9050, writeLocation=None, prettify=True):
	"""

	Args:
	    url: url to retrieve html from 
	    userAgent: userAgent to specify in headers
	    writeLocation: if specified, complete location where to store html scraped

	Returns:
	    The scraped html

	"""
	if tor:
		session = enableTor(port)
	else:
		session = requests.session()
		r = session.get('http://httpbin.org/ip')
		# print( "NOT using Tor. Sending requests from port: {} and ip: {}".format(port, r.text) )

	# Request
	if not userAgent:
		ua = random.choice(userAgents)
		# logging.info("Using user agent: " + str(ua))
	else:
		ua = userAgent

	headers = { "User-Agent":  ua}

	r = session.get(url, headers=headers)
	# print("\n\n\n\n\n", "FIRST PART OF RESPONSE: ", r.text[0:500], "\n\n\n\n\n\n")
	soup = BeautifulSoup(r.text, 'html.parser')
	

	if prettify:
		soup = pretty(soup)

	# Store if indicated
	if writeLocation:
		jsonSave(soup, writeLocation)
	
	session.close()

	return soup



def pretty(soup):
	soup = soup.prettify()
	# Don't care about non ascii
	soup = ''.join([i if ord(i) < 128 else ' ' for i in soup])	
	return soup

def match_class(target):       
    """

	Get html content by class

	"""                                                      
    def do_match(tag):                                                     
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
		# logging.info("Adding new matches to: " + str(writeLocation))
		with open(writeLocation, "r") as f:
			oldMatches = set(json.load(f))
		newMatches = set(data)
		data = oldMatches | newMatches
		data = list(data)
		encodedMatches = json.dumps(data)
		# logging.info("Old matches: " + str(oldMatches))
		# logging.info("New matches: " + str(newMatches))
		# logging.info("Combined matches: " + str(data))

		with open(writeLocation, "w+") as f:
			f.write(encodedMatches)
	else:
		# logging.info("Writing matches to new file: " + str(writeLocation))
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



# sleepTimes = [.25, .5, .75]
sleepTimes = [0]
# EOF