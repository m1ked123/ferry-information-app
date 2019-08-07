# Ferry Information Application

The new incarnation of the Ferry Information Application. This project only includes the code that is used for the web application.

# Build Instructions
To build this project on your own computer, including standing up the necessary ExpressJS server, use the following steps:
1. Install download repo and insall npm.
2. Create a folder called `config` at the root level.
3. Create a `config.json` file in the `config` foler that looks like:
    ```json
    {
        "apiKey": "<your api key>"
    }
    ```
An API key can be created at [WSDOT Traveler Information API](https://www.wsdot.wa.gov/traffic/api/).

4. Run the following command in the console. This will create an `app` folder and a `config` folder if one does not exist. To work, you must have a `config.json` folder with valid API key.
    ```shell
    npn run build 
    ```