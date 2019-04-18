This application can be used to scrape data about what skills are being demanded for different jobs in different US cities. See https://medium.com/@jackgrundy/automatically-compiling-data-from-indeed-com-about-what-tech-skills-are-in-demand-7be6e9ecd0f1 for an illustration.  
  
It uses a dockerized, microservice architecture. Pieces include:  
A) Fronted: React interface  
B) Backend: Node.js/Express. Serves two purposes: 1) Upon request from the front end, draws data from MongoDB, formats, and then sends the data back. This data is used to create a dashboard. 2) Manages a RabbitMQ message queue (see E).  
C) Aforementioned MongoDB database  
D) Aforementioned RabbitMQ message queue.  
E) A celery process that retrieves messages from RabbitMQ and then spins up worker threads that use beautiful soup to scrape indeed. Stores results in MongoDB. Will run a Tor process and direct requests through it if specified.   

Note, docker-compose.yml sets key environment variables. Notably, sleep time and whether Tor is used for requests or not.  
  
Usage:  
Install docker: https://docs.docker.com/v17.12/install/  
git clone https://github.com/JackMGrundy/tech-skills-scraper-and-visualizer.git  
navigate to frontend folder  
docker-compose up -d --build  
docker-compose up  
Open localhost:3000 in browser  
