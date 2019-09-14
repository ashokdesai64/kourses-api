const express = require('express');
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

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
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

require('./app/routes/main.routes.js')(app)
// define a simple route
app.get('/', (req, res) => {
    // res.sendFile(__dirname + "/app/index.html");
    res.send('hello world')
});
// listen for requests

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
});

app.listen(8080, () => {
    console.log("Server is listening on port 3000");
});