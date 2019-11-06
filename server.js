const express = require('express');
var ip = require("ip");
var cors = require('cors')
const bodyParser = require('body-parser');
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
var multer = require('multer');
const app = express();
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        var datetimestamp = Date.now();
        callback(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
var upload = multer({ storage: storage });

// mongoose.Promise = global.Promise;
// mongoose.set('findOneAndUpdate', true);
// mongoose.connect(dbConfig.url, {
//     useNewUrlParser: true
// }).then(() => {
//     console.log("Successfully connected to the database");
// }).catch(err => {
//     console.log('Could not connect to the database. Exiting now...', err);
//     process.exit();
// });


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:admin@1234@cluster0-qgwmp.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});


// create express app
app.use(cors());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - formdata
app.use(upload.array('myfile',10));
app.use(express.static('public'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

require('./app/routes/main.routes.js')(app)
// define a simple route
app.get('/', (req, res) => {
    // res.sendFile(__dirname + "/app/index.html");
    res.send('hello world')
});
// listen for requests

app.listen(8080, () => {
    console.log("Server is listening on port 3000");
});

// app.set('port', process.env.PORT || 8080);
// app.set('host', process.env.HOST || ip.address());


app.listen(app.get('port'), function () {
    console.log('Listening to port:  ' + ip.address() +':8080');
})
