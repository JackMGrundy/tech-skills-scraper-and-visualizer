This application can be used to scrape data about what skills are being demanded for different jobs in different US cities. See https://medium.com/@jackgrundy/automatically-compiling-data-from-indeed-com-about-what-tech-skills-are-in-demand-7be6e9ecd0f1 for an illustration.  
  
It uses a dockerized, microservice architecture. Pieces include:  
A) Fronted end react interface  
B) Node.js/Express backend that receives requests. It draws data from a MongoDB database and submits requests for scraping to a RabbitMQ message queue.  
C) Aforementioned MongoDB database  
D) Aforementioned RabbitMQ message queue.  
E) A celery process that retrieves messages from RabbitMQ and then spins up worker threads that use buetiful to scrape indeed and then store results in Mongo. Will also run a Tor process and direct requests through it if specified.  

Note, docker-compose.yml sets key environment variables. Notably, sleep time and whether Tor is used for requests or not.  
  
Usage:  
git clone https://github.com/JackMGrundy/tech-skills-scraper-and-visualizer.git  
navigate to frontend folder  
docker-compose up -d --build  
docker-compose up  
Open localhost:3000 in browser
