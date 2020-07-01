# Ferry Information Application

The new incarnation of the Ferry Information Application. This project includes all of the code for the web application.

## Install Instructions
To run this project on your own computer, including standing up the necessary ExpressJS server, use the following steps:
1. Download the repo and make sure that Docker Desktop is installed.
2. Create a `config.json` file in the `routes` foler that looks like:
    ```json
    {
        "apiKey": "<your api key>"
    }
    ```
An API key can be created at [WSDOT Traveler Information API](https://www.wsdot.wa.gov/traffic/api/). You can use the provided template file to ensure consistency.
3. Build the docker image and then run the container.
4. Navigate to http://localhost:3000 to view the application running.
