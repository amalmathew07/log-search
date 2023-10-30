# Log Search project
This project is designed to efficiently search through log files and providing users with the ability to retrieve the latest matching logs for a given pattern. The application has a backend API built with Node.js and Express, and a frontend UI developed with React. This application is designed to retrieve logs in the ```/var/logs``` folder in the machine in which it is running on.

## Installation and setup
After cloning the repo to your local machine, both backend and front end application has to be setup.

### Backend API
1. Navigate to the backend folder from the root directory using ```cd log-search-api```
2. Install npm packages using ```npm install```
3. Start the server by running ```npm run start``` and the backend api will be running at ```http://localhost:3000```

### Front end API
1. Navigate to the front end folder from the root directory using ```cd log-search-ui```
2. Install npm packages using ```npm install```
3. Start the server by running ```npm run start``` and the front end react app will be running at ```http://localhost:9000```

### Starting both application together
Once the inital setup of installing npm packages are done for both front end and back end (which is a one time process), navigate to the root folder (```log-searcg```) and run ```npm run start```. This will run the server on 
```http://localhost:3000``` and UI application on ```http://localhost:9000```. Please note that this will only work once **the npm packages are installed using ```npm install``` by navigating into respective folders**

## Testing the application
The application can be tested in two ways using the front end app as described above or API clients like POSTMAN (also there is a test log file in the ```/var/log``` folder in the ```log-search-api``` folder): 

### Using the front end application
This is the most user friendly and preferred way to test the log search capability. 
1. Once the UI app is started, open ```http://localhost:9000``` which will take the user to the log seach home page.
2. Provide the required inputs - pattern and filename are required fields, while count can be blank, but cannot be 0 or less. Corresponding validation messages will be shown as a toast to the user if any of the inputs fails the validation
3. If the count is given as blank, it will search for all the entries in the given file.
4. Click on the **Search Logs** button and the results will be displayed in a table format with the pattern string highlighted in the **Log Entry** column of the table.
5. If there is any error or if there are not results for the input given, it display the error toast.
6. A success toast will be displayed once the data fetch is successful. If the total count of data is too high, pagination is introduced to switch between pages

### Using POSTMAN client
1. The backend end point for retrieving log is defined as ```/logs```. Provide ```http://localhost:3000/logs``` in URL section of the postman
2. Provide proper inputs, pattern and file name required and count can be blank (but cannot be 0 or less than 0).
3. Click the Send button and the results (or error message) will be displayed in JSON format

## Testing Demos
UI App Demo - https://monosnap.com/file/QMw2BMF6E1XikClfExOh8YnEsBqmj2
Postman Test Demo - https://monosnap.com/file/danTMNVUn34xePVvFT6Sr1x3iltPS5

## Documentation
Technical design document: https://docs.google.com/document/d/1IbLD6d413uOOLUweF1IOhVChW9sdG1kTV_jVIWt5NUA/edit
