const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
var expressValidator = require('express-validator');
const fs = require('fs');

var app = express();
app.set('view engine', 'ejs');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Some server info
const port = 8080;

// Some data to create a connection to the database
const databaseName = 'aircompany';

// Some information for routing
const indexRoute = 'index';
const tableRoute = 'table';
const db_location = './public/create_tables.sql';

// Status codes
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500

// Status messages
const internalErrorMessage = 'Oops, some internal issues occured... Please, try again!';

// Logs
const serverLog = `Server started on port ${port}.`;
const connectionLog = 'MySql database was connected.';

// Tables
const table1 = 'flights';
const table2 = 'users';
const table3 = 'tickets';

// Some information for UI
const upCaseDataBase = databaseName[0].toUpperCase() + databaseName.slice(1);
const opInsert = 'Insert';
const opUpdate = 'Update';

const connectionString = 'mysql://root:root@192.168.99.100:3307/aircompany_db?charset=utf8_general_ci&timezone=-0700';
var db = mysql.createConnection(connectionString);

db.connect((err) => {
    if (err) {
        throw(err);
    }
    console.log(connectionLog);
});

const sqlFile = fs.readFileSync(db_location).toString();
const arrSql = sqlFile.split('\r\n\r\n');
for (let i in arrSql) {
    const query = db.query(arrSql[i], (err, results) => {
        if (err) {
            throw(err);
        }
    });
}

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg   : msg,
        value : value
    };
  }
}));

function insertRow(table, newValues) {
    const sql = `INSERT INTO ${table} SET ${newValues};`;
    const query = db.query(sql, (err, results) => {
        let statusCode = 0;
        err ? statusCode = INTERNAL_SERVER_ERROR : statusCode = CREATED;
        return statusCode;
    });
}

function deleteRow(table, condition) {
    const sql = `DELETE FROM ${table} WHERE ${condition};`;
    const query = db.query(sql, (err, results) => {
        let statusCode = 0;
        err ? statusCode = INTERNAL_SERVER_ERROR : statusCode = NO_CONTENT;
        return statusCode;
    });
}

function updateRow(table, newValues, condition) {
    const sql = `UPDATE ${table} SET ${newValues} WHERE ${condition};`;
    const query = db.query(sql, (err, results) => {
        let statusCode = 0;
        err ? statusCode = INTERNAL_SERVER_ERROR : statusCode = NO_CONTENT;
        return statusCode;
    });
}

global.urlencodedParser = urlencodedParser;
global.db = db;
global.expressValidator = expressValidator;

global.databaseName = databaseName;
global.upCaseDataBase = upCaseDataBase;
global.tableRoute = tableRoute;
global.opInsert = opInsert;
global.opUpdate = opUpdate;

global.insertRow = insertRow;
global.deleteRow = deleteRow;
global.updateRow = updateRow;

global.OK = OK;
global.CREATED = CREATED;
global.NO_CONTENT = NO_CONTENT;
global.BAD_REQUEST = BAD_REQUEST;
global.INTERNAL_SERVER_ERROR = INTERNAL_SERVER_ERROR;

global.internalErrorMessage = internalErrorMessage;

app.get('/', function(req, res) {
    res.status(OK).render(indexRoute, {database: upCaseDataBase,
        table1: table1, table2: table2, table3: table3});
});

const routerTable1 = require(`./routes/${table1}`);
const routerTable2 = require(`./routes/${table2}`);
const routerTable3 = require(`./routes/${table3}`);
app.use(`/${table1}`, routerTable1);
app.use(`/${table2}`, routerTable2);
app.use(`/${table3}`, routerTable3);

app.listen(port, () => {
    console.log(serverLog);
});;
