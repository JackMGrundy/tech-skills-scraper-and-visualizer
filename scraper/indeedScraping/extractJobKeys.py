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

from indeedScraping.util.userAgents import userAgents
from indeedScraping.util.helpers import uniqueItems, extractHTML, jsonSave, formatDateForMongo, replaceDict, match_class, sleepTimes

# import logging
from datetime import datetime, timedelta

def extractIndeedJobSearchHTML(searchTerm, index, userAgent, tor=False, port=9050, writeLocation=None):
	"""
	Wrapper around extractHTML for extract a list of jobs from an Indeed.com job search

	Args:
	    searchTerm: search term to query indeed for
	    index: Indeed returns results in batches indexed by increment of 10. This indicates which batch to select
	    userAgent: userAgent to specify in headers
	    writeLocation: if specified, complete location where to store html scraped

	Returns:
	    The scraped html

	"""
	searchTerm = searchTerm.replace(" ", "+")
	urlStub = "https://www.indeed.com/jobs?q="
	# Add search term
	url = urlStub + str(searchTerm)
	# Add index of page to search
	url += "&start=" + str(index)

	# logging.info("Drawing keys from: " + str(url))
	html = extractHTML(url=url, userAgent=userAgent, tor=tor, port=port, writeLocation=writeLocation)
	return html

def extractMatchesFromIndeedJobSearch(html, searchRegexEx, writeLocation=None):
	"""

	Args:
	    html: cleaned (encoding not dealt with) html from an indeed search page. This is current as of 12/2018. If the underlying html format changes, this may fail.
	    searchRegexEx: regex string to use for searching the html
	    writeLocation: if specified, complete location where to store job keys scraped

	Returns:
	    A python list of jobKeys extracted

	"""	
	jobKeyRegex = re.compile(searchRegexEx)
	matches = jobKeyRegex.findall(html)

	# Store if indicated
	if writeLocation:
		jsonSave(matches, writeLocation)	

	return matches



def batchExtractMatches(numPages, searchTerm, searchRegexEx, tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, htmlWriteLocations=None, 
					matchWriteLocations=None, pageIncrements=10):
	"""

	Args:
		numPages: number of indeed result pages to scrape
	    searchTerm: search term to query indeed for
	    searchRegexEx: regex to use to search each page of results
	    userAgent: user agent to use in header. Defaults to a random user agent.
	    sleepTime: time to sleep between requests. Default to a random time between 1 and 10 seconds.
	    htmlWriteLocations: list of locations to store html retrieved. One location per page.
	    matchWriteLocations: list of locations to store matces retrieved. One location per page.
	    matchSingleWriteLocation: location to write entire list of matches retrieved, rather than breaking them into pieces
	    pageIncrements: Indeed indexes their results so that the first page of results is indexed at "0", the next at "10", and so on.

	Returns:
	    The scraped aggregated list of matches

	"""
	if (htmlWriteLocations and len(htmlWriteLocations)!=numPages) or (matchWriteLocations and len(matchWriteLocations)!=numPages):
		raise Exception('The number of write locations does not equal the number of pages to be scraped')

	# List of matches to return
	allMatches = []

	# Indeed numbers their page results in increments of 10 from 0 to 990. Draw a random selection of pages to sample
	pageNumbers = random.sample(range(0, 1000, 10), numPages)

	# Extract matches for specified number of pages
	for i in range(len(pageNumbers)):
		index = pageNumbers[i]
		# Extract html
		if htmlWriteLocations:
			nextHtmlWriteLocation = htmlWriteLocations[i]
		else:
			nextHtmlWriteLocation = None

		if not userAgent:
			ua = random.choice(userAgents)

		html = extractIndeedJobSearchHTML(searchTerm=searchTerm, index=index, userAgent=ua, tor=tor, port=port, writeLocation=nextHtmlWriteLocation)


		# Extract matches from html
		if matchWriteLocations:
			nextMatchWriteLocation = matchWriteLocations[i]
		else:
			nextMatchWriteLocation = None

		matches = extractMatchesFromIndeedJobSearch(html, searchRegexEx=searchRegexEx, writeLocation=nextMatchWriteLocation)

		allMatches += matches

		# Sleep random amount of time
		if not sleepTime:
			time.sleep(random.choice(sleepTimes))
		else:
			time.sleep(sleepTime)

	
	if matchSingleWriteLocation:
		jsonSave(allMatches, matchSingleWriteLocation)

	return uniqueItems(allMatches)


# def main(args):
# 	if not args['pageIncrements']:
# 		args['pageIncrements'] = 10

# 	if not args['searchRegexEx']:
# 		args['searchRegexEx'] = "jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \="


	# logging.basicConfig(
	# 	filename="scrape.log",
	#     format='%(asctime)s %(levelname)-8s %(message)s',
	#     level=logging.DEBUG,
	#     datefmt='%Y-%m-%d %H:%M:%S')

	# matches = batchExtractMatches(numPages=args['numPages'], searchTerm=args['searchTerm'], searchRegexEx=args['searchRegexEx'], 
  	# 					sleepTime=args['sleepTime'], matchSingleWriteLocation=args['matchSingleWriteLocation'], 
  	# 					htmlWriteLocations=args['htmlWriteLocations'], pageIncrements=args['pageIncrements'], 
  	# 					matchWriteLocations=args['matchWriteLocations'], userAgent=args['userAgent'])

	# return len(matches)
  

# if __name__=='__main__':
	# a = extractIndeedJobSearchHTML(searchTerm="software engineer", index="1", userAgent=userAgents[0])
	# print(a)
	# a = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx="jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \=", matchSingleWriteLocation=None, userAgent=None, sleepTime=None, htmlWriteLocations=None, 
					# matchWriteLocations=None, pageIncrements=10)
	# print(a)


	# index = 5
	# searchTerm = "data scientist"
	# userAgent = userAgents[0]
	# searchTerm = searchTerm.replace(" ", "+")
	# urlStub = "https://www.indeed.com/jobs?q="
	# # Add search term
	# url = urlStub + str(searchTerm)
	# # Add index of page to search
	# url += "&start=" + str(index)

	# # logging.info("Drawing keys from: " + str(url))
	# html = extractHTML(url=url, userAgent=userAgent)
	# print(html)

# if __name__== "__main__":
# 	parser = argparse.ArgumentParser(description='Scrape indeed job search pages')
# 	parser.add_argument('numPages', type=int)
# 	parser.add_argument('searchTerm', type=str)
# 	parser.add_argument('searchRegexEx', type=str, nargs='?')
# 	parser.add_argument('userAgent', type=str, nargs='?')
# 	parser.add_argument('sleepTime', type=int, nargs='?')
# 	parser.add_argument('htmlWriteLocations', type=list, nargs='?')
# 	parser.add_argument('matchWriteLocations', type=list, nargs='?')
# 	parser.add_argument('pageIncrements', type=int, nargs='?')
# 	parser.add_argument('--matchSingleWriteLocation', type=str, nargs='?')

# 	args = parser.parse_args()
# 	try:
# 		ret = main(vars(args))
# 		print("Scraped " + str(ret) + " matches")
# 	except:
# 		print("Unexpected error:", sys.exc_info()[0])
# 		tb = traceback.format_exc()
# 		print(tb)

# python extractJobKeys.py 5 "data scientist"  --matchSingleWriteLocation "job-keys.json"
# EOF