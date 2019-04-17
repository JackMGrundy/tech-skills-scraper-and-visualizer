git clone https://github.com/JackMGrundy/tech-skills-scraper-and-visualizer.git  
navigate to frontend folder  
docker-compose up -d --build
docker-compose up  

Note, docker-compose.yml sets key environment variables. Notably, sleep time and whether Tor is used for requested or not.

See:  
https://medium.com/@jackgrundy/automatically-compiling-data-from-indeed-com-about-what-tech-skills-are-in-demand-7be6e9ecd0f1