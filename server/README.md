# Subscription System
A web based software using mysql database to effectively manage newsletter subscription operations.

## Tech Stack
The project mainly focuses on the Mysql database and its connectivity:
1. **MYSQL** <br>
MySQL is an open-source relational database management system.
2. **Express** <br>
A Node.js web framework which acts as a middleware for the function of creating robust APIs.
3. **HTML-CSS**<br>
Languages for Web interaction .
4. **Nodejs**<br>
Node.js is a free, open-sourced JavaScript run-time environment that lets developers write command line tools and server-side scripts outside of a browser.
<p> Additional Dependencies installed :</p>
<ul>
<li>mysql
<li>body-parser
<li>ejs
<li>express-session
<li>nodemon
<li>dotenv
</ul>

## Installation

1. Install MYSQL Workbench and Server
2. Update and RUN `schema.sql` base on what you need 
3. Installation of all the packages need to be done before hosting the Web App. Execute the following commands:
    1. `mkdir ESS && cd ESS`
    2. `git clone `
    3. `cd `
    4. `npm install`
    5. `npm run dev`

4. The app has been hosted on port : 3000 


## Test API

1. Install `Postman` 
2. Inside the postman import `Newletter.postman_collection.json`


## DB possible problem

1. Problem in accesing your server try to run this and change the password you are using `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'asdfjkl';`

   