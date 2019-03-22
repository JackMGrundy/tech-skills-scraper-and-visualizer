import unittest
import os
import bs4 

from indeedScraping.util.helpers import uniqueItems, pretty, extractHTML, jsonSave, formatDateForMongo, replaceDict, match_class, sleepTimes

from indeedScraping.extractJobKeys import extractMatchesFromIndeedJobSearch, extractIndeedJobSearchHTML, batchExtractMatches
from indeedScraping.extractJobInfo import extractJobHTML, cleanHTML, getTags, getPostDate, getLocation, extractJobInfo

os.environ["JOB_KEYS_REGEX"] = "jobKeysWithInfo\[\'([A-Za-z0-9]+)\'\] \="


class TestUtils(unittest.TestCase):

    def test_extractHTML(self):
        testHtml = extractHTML(url='https://www.google.com', userAgent=None, tor=False, port=9050, writeLocation=None, prettify=True)
        self.assertIn("<html", testHtml)
        self.assertIn("</html>", testHtml)     

    # Test matchClass is used to extract the description area of a job post. These are present in every indeed post as of
    # 3/22/2019. This test ensures that matchClass (used as intended) captures this area
    def test_matchClass(self):
        keys = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
					                matchWriteLocations=None, pageIncrements=10)
        key = keys[0]
        soup = extractJobHTML(jobKey=key, tor=False, port=None, prettify=False)
        description = str(soup.find_all(match_class(["jobsearch-JobComponent-description"])))
        self.assertIn("class=\"jobsearch-JobComponent-description", description)


class TestExtractJobKeys(unittest.TestCase):

    def test_extractIndeedJobSearchHTML(self):
        testHtml = extractIndeedJobSearchHTML(searchTerm="software engineer", index=1, userAgent=None, 
                                            tor=False, port=9050, writeLocation=None)
        self.assertIn("<html", testHtml)
        self.assertIn("</html>", testHtml)  

    def test_extractMatchesFromIndeedJobSearch(self):
        # Directories
        wd = os.path.dirname(os.path.realpath(__file__))
        testCasesFolder = os.path.join(wd, 'testCases')
        jobListsingsFolder = os.path.join(testCasesFolder, "jobListings")
    
        # Get test case html
        f = open(os.path.join(jobListsingsFolder, 'data-scientist-page1.txt'))
        dataScientistsPage1HTML = f.read()
        f.close()

        f = open(os.path.join(jobListsingsFolder, 'data-scientist-page2.txt'))
        dataScientistsPage2HTML = f.read()
        f.close()

        f = open(os.path.join(jobListsingsFolder, 'software-engineer-page3.txt'))
        softwareEngineerPage3HTML = f.read()
        f.close()


        self.assertEqual(extractMatchesFromIndeedJobSearch(dataScientistsPage1HTML, os.environ["JOB_KEYS_REGEX"]), 
            ['d37cbf98e7491ec2', 'c560bd704c913219', '347ee881443f895c', '53ff6f40fb926fcb', 'b624d2f438dda33e', 
            '3a8e7946c917934e', '390872802deea776', '8f037658842036e6', '20373689d32a71e4', '8581f40100d96fb1', 
            '75b8e7f65f403215', '62de457757aaa10e', '5842a86b26f1647a', '3a8e80fd87f133e9', '439998d776558b13', 
            'f81e2dd4416648f7', '3b717c274029b71e', '447937ea92eb8317', '579b5b7fb4c45c9c'])
        
        self.assertEqual(extractMatchesFromIndeedJobSearch(dataScientistsPage2HTML, os.environ["JOB_KEYS_REGEX"]),
            ['c560bd704c913219', '71f7974c13336832', '2cba9725e653940e', 'aa2d651916294d68', 'e93ff744010f4c39', 
            '97d415d3e5e40dff', '8f037658842036e6', '20373689d32a71e4', '8232e5cf71fe022c', '36bbd4a916f7d9a5', 
            'cf05506c42c5f644', 'fbbeed55473dfd05', '3a8e80fd87f133e9', '08228741be7f751a', '602e88acaf1bee41', 
            '2a4b74f05f80b0bb', 'f81ddadca42df600', 'c0825351a59d6054', 'de0baf378cf76cc5'])
        
        self.assertEqual(extractMatchesFromIndeedJobSearch(softwareEngineerPage3HTML, os.environ["JOB_KEYS_REGEX"]), 
            ['5b852c053ce1b0eb', '624c1b7f981ac859', '15701916fc1df205', 'd37cbf98e7491ec2', '3fa6c474d65ff287', '9a3cc8327ef8b1bc', 
            'eaabdcb69eefb82e', '1a2274ca4b6210c0', '8a48cb08553a9c64', '6a2e0ff689790029', '71359302efe41155', '8f69aaf516243a73', 
            '818978896695e68c', '2cfeb4a6b89abd1b', 'e531e717b30ff7f4', '67b7cab034ff9ac4', '92056209899491d6', '602e88acaf1bee41', 
            '539156b7b748cd84'])

    # batchExtractMatches extracts batches of "jobkeys", Indeed's unique identifier for jobs, that correspond with a search
    # term such as "software engineer". As long there is at least 1 post for a "software engineer" job on Indeed,
    # this should return jobkeys and these should be alphanumeric.
    def test_batchExtractMatches(self):
        keys = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
        matchWriteLocations=None, pageIncrements=10)
        self.assertIsInstance(keys, list)
        self.assertRegex(keys[0], "[a-zA-Z0-9]")
    

class TestExtractJobInfo(unittest.TestCase):

    def test_extractJobHTML(self):
        keys = batchExtractMatches(numPages=1, searchTerm="data scientist", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
					                matchWriteLocations=None, pageIncrements=10)
        key = keys[0]
        soup = extractJobHTML(jobKey=key, tor=False, port=None, prettify=False)   
        self.assertIsInstance(soup, bs4.BeautifulSoup)  


    def test_cleanHTML(self):
        testString = "ABC€©§¶←↑→↓↔"
        res = cleanHTML(testString, lowercase=True, removeNonAscii=True, cutoffFooter=False, descriptionOnly=False, replaceDict=None)   
        self.assertEqual(res, "abc         ")
    
    # getTags takes a dictionary of search terms. Each key is a "tag" and each value is a list of strings that indicate the 
    # "tag" is present in the search string. For example, a tag might be "ai" and a value in its list might be 
    # "artificial intelligence". So if "aritifical intelligence" is contained in the search string, then the list of 
    # returned ("matched") tags will include "ai". 
    def test_getTags(self):
        keys = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
					                matchWriteLocations=None, pageIncrements=10)
        key = keys[0]
        soup = extractJobHTML(jobKey=key, tor=False, port=None, prettify=False) 
        testTags = {"commonWords": ["a", "the", "an", "by", "for", "but"], "software": ["software"]} 
        matchedTags = getTags(soup=soup, tags=testTags, replaceDict=replaceDict)
        self.assertIn("commonWords", matchedTags)
        self.assertIn("software", matchedTags)
    

    def test_getPostDate(self):
        testLen = 15 #Must adjust numPages if this is set to 20 or higher
        keys = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
					                matchWriteLocations=None, pageIncrements=10)
        dates = []
        for key in keys[:testLen]:
            soup = extractJobHTML(jobKey=key, tor=False, port=None, prettify=False)        
            dates.append(getPostDate(soup, replaceDict))
        
        for date in dates:
            if date==None: 
                continue
            self.assertRegex(date, "[0-9]{4}-[0-9]{2}-[0-9]{2}")
        
        self.assertEqual(len(dates), testLen)


    def test_getLocation(self):
        testLen = 15 #Must adjust numPages if this is set to 20 or higher
        keys = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
					                matchWriteLocations=None, pageIncrements=10)
        locs = []
        for key in keys[:testLen]:
            soup = extractJobHTML(jobKey=key, tor=False, port=None, prettify=False)        
            locs.append(getLocation(soup, replaceDict))
        
        for loc in locs:
            if loc==None: 
                continue
            self.assertRegex(loc[0], "[a-z]+")
            self.assertRegex(loc[1], "[a-z]{2}")
        
        self.assertEqual(len(locs), testLen)
    

    def test_extractJobInfo(self):
        keys = batchExtractMatches(numPages=1, searchTerm="software engineer", searchRegexEx=os.environ["JOB_KEYS_REGEX"], 
                                    tor=False, port=9050, matchSingleWriteLocation=None, userAgent=None, sleepTime=None, 
                                    htmlWriteLocations=None, 
					                matchWriteLocations=None, pageIncrements=10)

        key = keys[0]        
        res = extractJobInfo(key, replaceDict, technologies={'software': ['software']}, tor=False, port=9050)

        self.assertIn("posted", res.keys())
        self.assertIn("city", res.keys())
        self.assertIn("state", res.keys())
        self.assertIn("technologies", res.keys())
        self.assertIn("jobkey", res.keys())


if __name__ == '__main__':
    unittest.main()