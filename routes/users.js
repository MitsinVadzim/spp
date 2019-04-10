const express = require('express');
const router = express.Router();

// Some information for queries
const table = 'users';

// Some information for UI
const columns = ['#', 'login', 'password'];
const upCaseColumns = ['id', 'Login', 'Password'];

// Some information for routing
const changeRoute = 'change/users';

// Some validation information
const loginMax = 50;
const passwordMin = 8;
const passwordMax = 20;

// Some validation messages
const msgLoginIncorrect = 'Login should be a valid email!';
const msgLoginMax = `Login must contain not more than ${loginMax} symbols!`;

const msgPasswordMin = `Password must contain at least ${passwordMin} symbols!`;
const msgPasswordMax = `Password must contain not more than ${passwordMax} symbols!`;
const msgPasswordAsciiOnly = 'Password may contain only ASCII symbols!';
const msgPasswordDigits = 'Password must contain at least 1 digital!';
const msgPasswordLowLatin = 'Password must contain at least 1 latin lowercase letter!';
const msgPasswordUpLatin = 'Password must contain at least 1 latin uppercase letter!';

router.post('/delete/:id', urlencodedParser, function(req, res) {
    const statusCode = deleteRow(table, `id = ${req.params.id}`)
    res.status(statusCode).redirect(`/${table}`);
});

var operation = null;
var id = 0;

router.post('/insert', urlencodedParser, function(req, res) {

  operation = opInsert;
  id = 0;

  res.status(OK).render(changeRoute, {database: upCaseDataBase,
      table: table, columns: columns, upCaseColumns: upCaseColumns,
      operation: operation, rows: null, errors: null});

});

router.post('/update/:id', urlencodedParser, function(req, res) {

  operation = opUpdate;
  id = req.params.id;

  const sql = `SELECT * FROM ${table} WHERE id = ${id};`;
  const query = db.query(sql, (err, rows) => {
      if (err) {
          res.status(INTERNAL_SERVER_ERROR).send(internalErrorMessage);
      }
      else {
          res.status(OK).render(changeRoute, {database: upCaseDataBase,
              table: table, columns: columns, upCaseColumns: upCaseColumns,
              operation: operation, rows: rows, errors: null});
      }
  });

});

function validateRequest(req) {

  req.check('login')
      .trim()
      .isEmail().withMessage(msgLoginIncorrect)
      .isLength({ max: loginMax }).withMessage(msgLoginMax)

  req.check('password')
      .isLength({ min: passwordMin }).withMessage(msgPasswordMin)
      .isLength({ max: passwordMax }).withMessage(msgPasswordMax)
      .isAscii().withMessage(msgPasswordAsciiOnly)
      .matches('[0-9]').withMessage(msgPasswordDigits)
      .matches('[a-z]').withMessage(msgPasswordLowLatin)
      .matches('[A-Z]').withMessage(msgPasswordUpLatin);

  return req.validationErrors();

}

router.post('/save', urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(BAD_REQUEST).render(changeRoute, {
            database: upCaseDataBase, table: table,
            columns: columns, upCaseColumns: upCaseColumns,
            operation: operation, rows: null, errors: errors});
    }
    else {

        const newValues = `login = "${req.body.login}
            ", password = "${req.body.password}"`;
        let statusCode = 0;
        if (operation == opInsert) {
            statusCode = insertRow(table, newValues);
        }
        else {
            statusCode = updateRow(table, newValues, `id = ${id}`);
        }

        res.status(statusCode).redirect('.');

    }
});

router.use('/', urlencodedParser, function(req, res) {
    const sql = `SELECT * FROM ${table} ORDER BY id ASC;`;
    const query = db.query(sql, (err, rows) => {
        if (err) {
            res.status(INTERNAL_SERVER_ERROR).send(internalErrorMessage);
        }
        else {
            res.status(OK).render(tableRoute, {database: upCaseDataBase,
                table: table, columns: columns, upCaseColumns: upCaseColumns,
                rows: rows});
        }
    });
});

module.exports = router;
