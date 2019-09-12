var express = require("express"),
    app = express(),
    pg = require("pg"),
    path = require("path");

/**
 * File upload via AWS S3 / Bucketeer Addon
 * For Amazon Data Center East
 */
/*var aws = require("aws-sd");
var s3 = new aws.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});*/

app.set("port", (process.env.PORT || 5000));

/*
* PG Client connection
*/
pg.defaults.ssl = true;

var dbString = process.env.DATABASE_URL;

var sharedPgClient;

pg.connect(dbString, function(err,client){
    if(err){
        console.error("PG Connection Error")
    }
    console.log("Connected to Postgres");
    sharedPgClient = client;
});

/*
 * ExpressJS View Templates
 */
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");

/*
 * Jobs Landing Page
 */
app.get("/",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.account";
    var result = [];
    sharedPgClient.query(query, function(err, result){
        console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index.ejs", {connectResults: result.rows});
    });
});

app.get("/contacts",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.account";
    var result = [];
    sharedPgClient.query(query, function(err, result){
        console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index1.ejs", {connectResults: result.rows});
    });
});

app.get("/mobile",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.account";
    var result = [];
    sharedPgClient.query(query, function(err, result){
        console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index2.ejs", {connectResults: result.rows});
    });
});

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Contact SET Phone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
            [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
                  [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

/*
 * Run Server
 */
var server = app.listen(app.get('port'), function(){
    console.log('Node Connect App Running at http://%s:%s', server.address().address, server.address().port);
});
