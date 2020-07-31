# Ferry Information Application

The new incarnation of the Ferry Information Application. This project includes all of the code for the web application. A working, demo of this application can be found at https://royal-loonie-56613.herokuapp.com/.

## Install Instructions
To run this project on your own computer, including standing up the necessary ExpressJS server, use the following steps:
1. Download the repo and make sure that Docker Desktop is installed.
2. Create a `.env` file at the base of the project directory that will store your `API_KEY`. An API key can be created at [WSDOT Traveler Information API](https://www.wsdot.wa.gov/traffic/api/). The image will not run properly and the ferries won't appear without a valid API Key.
3. Build the Docker image and then run the container.
4. Navigate to http://localhost:3000 to view the application running.
