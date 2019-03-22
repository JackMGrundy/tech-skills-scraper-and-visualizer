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
# import logging


from indeedScraping.util.userAgents import userAgents
from indeedScraping.util.helpers import uniqueItems, extractHTML, jsonSave, formatDateForMongo, replaceDict, match_class, sleepTimes


from datetime import datetime, timedelta

# logging.basicConfig(
# 	filename="scrape.log",
#     format='%(asctime)s %(levelname)-8s %(message)s',
#     level=logging.DEBUG,
#     datefmt='%Y-%m-%d %H:%M:%S')

# "3b753015197fb278"

def extractJobHTML(jobKey, tor=False, port=9050, userAgent=None, writeLocation=None, prettify=True):
	"""
	Wrapper around extractHTML to extract html for a job specified by the jobkey variable

	Args:
		jobKey: hashed id of job on indeed.com
	    userAgent: userAgent to specify in headers
	    writeLocation: if specified, complete location where to store html scraped

	Returns:
	    The scraped html

	"""
	urlStub = "https://www.indeed.com/viewjob?jk="
	# Add search term
	url = urlStub + str(jobKey)

	html = extractHTML(url=url, tor=tor, port=port, userAgent=userAgent, writeLocation=writeLocation, prettify=prettify)
	# logging.info("Extracted html for job: " + str(jobKey) + " from: " + str(url))
	return html


def cleanHTML(html, lowercase=False, removeNonAscii=False, cutoffFooter=False, descriptionOnly=False, replaceDict=None):
	""" 

	Args:
		html: html string
		lowercase: boolean indicating if the html should be sent to lowercase
		removeNonAscii: boolean indicating if the html should have non ascii characters removed
		replaceDict: a dictionary where keys represent words to be replaced by their values   

	Returns:
	    The html with the following adjustments:
	    	Replace following with spaces: ( ) /
			send to lowercase
			remove non ascii
	"""

	if lowercase:
		html = html.lower()

	if removeNonAscii:
		html = ''.join([i if ord(i) < 128 else ' ' for i in html])

	if replaceDict:
		for word, replaceWord in replaceDict.items():
			html = html.replace(word.lower(), replaceWord)

	if cutoffFooter:
		html = html.split("html = html.split(" ")")
		html = html[0]

	if descriptionOnly:
		"jobsearch-JobComponent-description"

	return html


def getTags(soup, tags, replaceDict):
	""" 

	Args:
		soup: bs4 html representing a job page
	    tags: a dictionary where the key is a tag and each value is a list of words.

	Returns:
	    A list of tags for which there was at least one word in their value lists that appeared in the html

	"""
	
	# Convert html to list for easier search
	# html = html.split(" ")
	
	# Limit search to description
	description = str(soup.find_all(match_class(["jobsearch-JobComponent-description"])))
	description = cleanHTML(description, lowercase=True, removeNonAscii=True, cutoffFooter=True, replaceDict=replaceDict)
	# logging.info("Extracting tags from description:\n " + str(description))

	matchedTags = []
	# Iterate through tags
	for tag, values in tags.items():
		# Iterate through each tag's values
		for value in values:
			if value in description:
				matchedTags.append(tag)
				continue
	
	# Unique
	matchedTags = list(set(matchedTags))
	return(matchedTags)



def getPostDate(soup, replaceDict):
	""" 

	Args:
		soup: bs4 soup string of an Indeed.com job post

	Returns: 
		the YYYY-MM-DD the post was made
		If indeterminate, returns None. This occurs if the job was posted over 30 days ago

	"""
	 
	# Subset search to footer
	footerArea = str(soup.find_all(match_class(["jobsearch-JobMetadataFooter"])))
	footerArea = cleanHTML(footerArea, lowercase=True, removeNonAscii=True, cutoffFooter=True, replaceDict=replaceDict)
	# logging.info("Scraping post date from: \n" + str(footerArea))

	# Assumption: 1st occurence of "__ days/hours ago" is the post date of the job listing
	# These pages are surprisingly sparse on dates
	dateRegex = re.compile("([0-9]+)(?:\+)* (days|hours|day|hour) ago ")
	matches = dateRegex.findall(footerArea)
	# logging.info("Found match dates of: " + str(matches))

	if not matches:
		return None

	num = matches[0][0]
	indicator = matches[0][1]

	# Today
	if indicator in ["hour", "hours"]:
		return datetime.today().strftime('%Y-%m-%d')

	# This month
	if indicator in ["day", "days"] and int(num)<30:
		date = datetime.today() - timedelta(days=int(num))
		return date.strftime('%Y-%m-%d')

	# Else, posted too long ago to discern date
	return None



def getLocation(soup, replaceDict):
	""" 

	Args:
		html: bs4 soup of an Indeed.com job post

	Returns: 
		Where the job is. This is indicated in the html by a description like: - Mountain View, CA

	"""
	# Subet search to title area
	titleArea = soup.find('title').string
	titleArea = cleanHTML(titleArea, lowercase=True, removeNonAscii=True, cutoffFooter=True, replaceDict=replaceDict)
	# logging.info("Scraping location from: \n" + str(titleArea))

	locationRegex = re.compile("- ([a-z\s,]+) (al|ak|az|ar|ca|co|ct|de|dc|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy) ")
	matches = locationRegex.findall(titleArea)
	# logging.info("Extracted title area: " + str(titleArea))
	# logging.info("Extracted location: " + str(matches))

	if matches:
		match = matches[0]
		city = match[0].strip()
		state = match[1].strip()
		return((city, state))
	else: 
		return None



def extractJobInfo(jobkey, replaceDict, technologies, tor=False, port=9050):
	""" 

	Args:
		jobkey: an indeed.com id for a job posting
		replaceDict: a dictionary of chars to replace
		technologies: a dictionary where keys indicate a technology and values are a list of terms
						that indicate the technology is contained in the job post

	Returns: 
		A dictionary indicating where the job is, what data science tech they want, what degree they want, when it was posted

	"""
	info = {}
	soup = extractJobHTML(jobKey=jobkey, tor=tor, port=port, prettify=False)
	info["posted"] = formatDateForMongo(getPostDate(soup, replaceDict=replaceDict))
	
	loc = getLocation(soup, replaceDict=replaceDict)
	if loc:
		info["city"] = loc[0]
		info["state"] = loc[1]
	else:
		info["city"] = None
	# info["technologies"] = getTags(soup=soup, tags=technologies, replaceDict=replaceDict)
	info["technologies"] = getTags(soup=soup, tags=technologies, replaceDict=replaceDict)
	# info["degrees"] = getTags(soup=soup, tags=degrees, replaceDict=replaceDict)
	info["jobkey"] = jobkey
	return info


def batchExtractJobInfo(jobkeys, replaceDict, technologies, tor=False, port=9050):
	""" 

	Args:
		jobkeys: a list of indeed.com ids for job postings
		replaceDict: a dictionary of chars to replace

	Returns: 
		A list of dictionaries. Each item indicates where the job is, what data science tech they want, what degree they want, when it was posted

	"""
	info = []
	for key in jobkeys:
		nextJob = extractJobInfo(key, replaceDict, technologies, tor=tor, port=port)

		# Job must have a post date, and location to be usable
		if nextJob["posted"] and nextJob["city"]:
			info.append(nextJob)
		time.sleep(random.choice(sleepTimes))

	return info
# EOF