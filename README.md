This application can be used to scrape data about what skills are being demanded for different jobs in different US cities. See https://medium.com/@jackgrundy/automatically-compiling-data-from-indeed-com-about-what-tech-skills-are-in-demand-7be6e9ecd0f1 for an illustration.  
  
There are 2 build options:  
  
(1) If you only want to run the application (you don't want the source code)  
-Download build-from-docker-hub/docker-compose.yml  
-Navigate to the folder where you downloaded docker-compose.yml  
-Execute "Docker-compose up"  
-Wait until everything is up and running (a few minutes to download and a few minutes to start up)  
-Navigate to localhost:3000 in your browser  
  
  
(2) If you want to play around with the source code and build new images  
-install docker: https://docs.docker.com/v17.12/install/ 
-git clone https://github.com/JackMGrundy/tech-skills-scraper-and-visualizer.git           
-Navigate to the root folder tech-skills-scraper-and-visualizer  
-Execute "docker-compose up --build"  
-Open localhost:3000 in browser    
  
  
Details:  
The app uses a dockerized, microservice architecture. Pieces include:  
A) Fronted: React interface  
B) Backend: Node.js/Express. Serves two purposes: 1) Upon request from the front end, draws data from MongoDB, formats, and then sends the data back. This data is used to create a dashboard. 2) Manages a RabbitMQ message queue (see E).  
C) Aforementioned MongoDB database  
D) Aforementioned RabbitMQ message queue.  
E) A celery process that retrieves messages from RabbitMQ and then spins up worker threads that use beautiful soup to scrape indeed. Stores results in MongoDB. Will run a Tor process and direct requests through it if specified.     
  
  
  
Notes:
1) There are two separate docker-compose.yml files, one for each build option: the first is at build-from-docker-hub/docker-compose.hml and pulls images from Docker hub, and the second is in the root folder.     
2) The docker-compose.yml files set key environment variables that control the app. Notably:  
a) TOR_ON: a boolean that indicates if requests will be sent through a Tor socket  
b) SLEEP_TIME: an int that indicates how many seconds to sleep between all requests  
c) SLEEP_TIME_POST_TASK: an int that indicates how many seconds to sleep after finishing a round of scraping  

3) This code is not perfect. There are many improvements to be made, but it fulfills its purpose of enabling quick extraction and summarization of demand for various tech skills. I might clean this up later. 
