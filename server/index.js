// Importing required libraries
var express = require("express");
var session = require("express-session");
var faker = require("faker");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var app = express();
require("dotenv").config();
//const bcrypt = require('bcrypt');
// Can be used for security but not needed right now

app.set("view engine", "ejs");

const key = "8062A83E1223A7DF0A13B75C6252799847DF"
// For Creating user session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));



// For Local Host
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "asdfjkl",
  database: "sql12373655",
  multipleStatements: true,
  port: 3306,
});

// For Cloud Host
// var connection = mysql.createConnection({
//   host     : process.env.HOST,
//   user     : process.env.USER,
//   password : process.env.PASSWORD,
//   database : process.env.DATABASE,
//   multipleStatements: true
// });

var userid = null;


app.get("/", function (req, res) {
  var q = "SELECT COUNT(*) AS count FROM users";
  connection.query(q, function (err, results) {
    if (err) throw err;
    var count = results[0].count;
    res.render("login", { data: count });
  });
});

app.post("/auth", function (request, response) {
  var email = request.body.email;
  var password = request.body.password;
  if (email && password) {
    connection.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = email;
          if (request.session.username == "admin") {
            response.redirect("/db");
          } else {
            response.redirect("/profile");
          }
        } else {
          response.send("Incorrect Email and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter email and Password!");
    response.end();
  }
});

app.get("/profile", function (request, response) {
  if (request.session.loggedin) {
    connection.query(
      "SELECT * FROM users where email=?; SELECT * FROM newsletters ORDER BY n_name; Select * from newsletters  join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id where email=?; ",
      [request.session.username, request.session.username],
      function (err, results) {
        userid = results[0][0].u_id;
        if (err) throw err;
        response.render("profile", {
          data1: results[0],
          data2: results[1],
          data3: request.session.username,
          data4: results[2],
        });
      }
    );
  }
});

app.get("/db", function (req, res) {
  // Find count of users in DB
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      'SELECT * FROM users where not email = "admin"; Select *,count(news_id) as c from newsletters  left join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id group by n_id; ',
      [1, 2],
      function (err, results) {
        if (err) throw err;
        res.render("db", { data1: results[0], data2: results[1] });
      }
    );
  }
});

app.get("/regpage", function (req, res) {
  var q = "SELECT COUNT(*) AS count FROM users";
  connection.query(q, function (err, results) {
    if (err) throw err;
    var count = results[0].count;
    res.render("register", { data: count });
  });
});

app.get("/unsub", function (req, res) {
  if (req.session.loggedin) {
    connection.query(
      "Select * from newsletters  join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id where email=?; select * from newsletters",
      [req.session.username, 2],
      function (err, results) {
        if (err) throw err;
        res.render("unsub", { data1: results[0], data2: results[1] });
      }
    );
  }
});

app.post("/unsubsucc", function (req, res) {
  if (req.session.loggedin) {
    var person = { id2: req.body.id2 };
    connection.query(
      "delete from subscriber where user_id =? and news_id= ?",
      [userid, person.id2],
      function (err, result) {
        console.log(err);
        console.log(result);
        res.redirect("/profile");
      }
    );
  }
});

app.get("/sort", function (req, res) {
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      "SELECT * FROM users where not email='admin' ORDER BY created_at desc ; Select *,count(news_id) as c from newsletters  left join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id group by n_id",
      [1, 2],
      function (err, results) {
        if (err) throw err;
        res.render("db", { data1: results[0], data2: results[1] });
      }
    );
  }
});

app.get("/signout", function (req, res) {
  req.session.loggedin = false;
  connection.query("Select * from newsletters", function (err, results) {
    if (err) throw err;
    res.render("login", { data1: results });
  });
});

app.get("/news", function (req, res) {
  if (req.session.loggedin) {
    connection.query("Select * from newsletters", function (err, results) {
      if (err) throw err;
      res.render("news", { data1: results });
    });
  }
});

app.get("/newsletter", function (req, res) {
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      "select * from newsletters",
      [1, 2],
      function (err, results) {
        if (err) throw err;
        res.render("newsletter", { data1: results[0] });
      }
    );
  }
});

app.post("/addnews", function (req, res) {
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      "INSERT INTO newsletters (n_name,description) VALUES ('" +
        req.body.n_name +
        "','" +
        req.body.description +
        "')",
      function (err, result) {
        console.log(err);
        console.log(result);
        res.redirect("/db");
      }
    );
  }
});

app.post("/subscribe", function (req, res) {
  if (req.session.loggedin) {
    connection.query(
      "INSERT INTO subscriber (user_id,news_id) VALUES (" +
        userid +
        "," +
        req.body.id2 +
        ")",
      function (err, result) {
        console.log(err);
        console.log(result);
        res.redirect("/profile");
      }
    );
  }
});

app.post("/regi", function (req, res) {
  if (req.body.password == req.body.password2) {
    connection.query(
      "INSERT INTO users (email,password,name) values('" +
        req.body.email +
        "','" +
        req.body.password +
        "','" +
        req.body.name +
        "')",
      function (err, result) {
        console.log(err);
        console.log(result);
        res.redirect("/");
      }
    );
  } else {
    res.send("Please enter correct email and Password!");
    res.end();
  }
});

//---------------------- API--------------

app.post("/api/reg", function (req, res) {
  if (req.body.password == req.body.password2) {
    connection.query(
      "INSERT INTO users (email,password,name) values('" +
        req.body.email +
        "','" +
        req.body.password +
        "','" +
        req.body.name +
        "')",
      function (err, result) {
        if(!result){
          res.status(400).json({ message: result,error: err });
        }else{
          res.status(200).json({ message: 'Successfully Registered!' });
        }
        return;
      }
    );
  } else {
    res.status(400).json({ error: 'Please enter correct email and Password!' });
    return;
  }
});

app.post("/api/subscribe", function (req, res) {
  if (req.session.loggedin) {
    connection.query(
      "INSERT INTO subscriber (user_id,news_id) VALUES (" +
        userid +
        "," +
        req.body.id2 +
        ")",
      function (err, result) {
        if(!result){
          res.status(400).json({ message: result,error: err });
        }else{
          res.status(200).json({ message: 'Successfully Subscribe!' });
        }
        return;
      }
    );
  }
});

app.post("/api/addnews", function (req, res) {
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      "INSERT INTO newsletters (n_name,description) VALUES ('" +
        req.body.n_name +
        "','" +
        req.body.description +
        "')",
      function (err, result) {
        if(!result){
          res.status(400).json({ message: result,error: err });
        }else{
          res.status(200).json({ message: 'Successfully Added!' });
        }
        return;
      }
    );
  }
});

app.post("/api/auth", function (request, response) {
  var email = request.body.email;
  var password = request.body.password;
  if (email && password) {
    connection.query(
      "SET GLOBAL sql_mode=''; SELECT * FROM users WHERE email = ? AND password = ?;",
      [email, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = email;
          if (request.session.username == "admin") {
            response.redirect("/api/db");
          } else {
            response.redirect("/api/profile");
          }
        } else {
          res.status(400).json({ message: "Incorrect Email and/or Password!" });
        }
        response.end();
      }
    );
  } else {
    res.status(400).json({ message: "Please enter email and Password!" });
  }
});

app.get("/api/profile", function (request, res) {
  if (request.session.loggedin) {
    connection.query(
      "SELECT * FROM users where email=?; SELECT * FROM newsletters ORDER BY n_name; Select * from newsletters  join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id where email=?; ",
      [request.session.username, request.session.username],
      function (err, results) {
        userid = results[0][0].u_id;
        if (err) throw err;
        res.status(200).json( {
          data1: results[0],
          data2: results[1],
          data3: request.session.username,
          data4: results[2],
         });
      }
    );
  }
});

app.get("/api/db", function (req, res) {
  // Find count of users in DB
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      'SELECT * FROM users where not email = "admin"; Select *,count(news_id) as c from newsletters  left join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id group by n_id; ',
      [1, 2],
      function (err, results) {
        if (err) throw err;
        res.status(200).json({ data1: results[0], data2: results[1] });
      }
    );
  }
});

app.get("/api/regpage", function (req, res) {
  var q = "SELECT COUNT(*) AS count FROM users";
  connection.query(q, function (err, results) {
    if (err) throw err;
    var count = results[0].count;
    res.status(200).json({ data: count });
  });
});

app.get("/api/unsub", function (req, res) {
  if (req.session.loggedin) {
    connection.query(
      "Select * from newsletters  join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id where email=?; select * from newsletters",
      [req.session.username, 2],
      function (err, results) {
        if (err) throw err;
        res.status(200).json({ data1: results[0], data2: results[1] });
      }
    );
  }
});

app.post("/api/unsubsucc", function (req, res) {
  if (req.session.loggedin) {
    var person = { id2: req.body.id2 };
    connection.query(
      "delete from subscriber where user_id =? and news_id= ?",
      [userid, person.id2],
      function (err, result) {
        if(!result){
          res.status(400).json({ message: result,error: err });
        }else{
          res.status(200).json({ message: 'Successfully Unsubscribe!' });
        }
      }
    );
  }
});

app.get("/api/sort", function (req, res) {
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      "SELECT * FROM users where not email='admin' ORDER BY created_at desc ; Select *,count(news_id) as c from newsletters  left join (Select * from users join subscriber on users.u_id = subscriber.user_id )as us on newsletters.n_id=us.news_id group by n_id",
      [1, 2],
      function (err, results) {
        if (err) throw err;
        res.status(200).json({ data1: results[0], data2: results[1] });
      }
    );
  }
});

app.get("/api/signout", function (req, res) {
  req.session.loggedin = false;
  connection.query("Select * from newsletters", function (err, results) {
    if (err) throw err;
    res.status(200).json({ message: 'Successfully SignOut!'});
  });
});

app.get("/api/news", function (req, res) {
  if (req.session.loggedin) {
    connection.query("Select * from newsletters", function (err, results) {
      if (err) throw err;
      res.status(200).json({ data1: results});
    });
  }
});

app.get("/api/newsletter", function (req, res) {
  if (req.session.loggedin && req.session.username == "admin") {
    connection.query(
      "select * from newsletters",
      [1, 2],
      function (err, results) {
        if (err) throw err;
        res.status(200).json({ data1: results[0] });
      }
    );
  }
});


app.listen(3000, function () {
  console.log(`Server API is working`);
});
