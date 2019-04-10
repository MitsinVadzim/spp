const express = require('express');

const router = express.Router();

// Some information for queries
const table = 'tickets';

// Some information for UI
const columns = ['#', 'price', 'id_user', 'id_flight'];
const upCaseColumns = ['id', 'Price', 'Id of user', 'Id of flight'];

// Some information for routing
const changeRoute = 'change/tickets';

// Some validation information
const nameMax = 50;

// Some validation messages
msgNameNotEmpty = "Name is required!";
msgNameMax = `Name must contain not more than ${nameMax} symbols!`;
msgNamePattern = 'Invalid name!';

msgMiddleNameMax = `Middle name must contain not more than ${nameMax} symbols!`;
msgMiddleNamePattern = 'Invalid middle name!';

msgLastNameNotEmpty = "Last name is required!";
msgLastNameMax = `Last name must contain not more than ${nameMax} symbols!`;
msgLastNamePattern = 'Invalid last name!';

router.post('/delete/:id', function(req, res) {
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
              operation: operation, rows: rows,
              errors: null});
      }
  });

});

function validateRequest(req) {

  req.check('price')
      .trim()
      .notEmpty().withMessage(msgNameNotEmpty)
      .isLength({ max: nameMax }).withMessage(msgNameMax);

  req.check('id_user')
      .trim()
      .isLength({ max: nameMax }).withMessage(msgMiddleNameMax);

  req.check('id_flight')
      .trim()
      .isLength({ max: nameMax }).withMessage(msgMiddleNameMax);

  return req.validationErrors();

}

router.post('/save', urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(BAD_REQUEST).render(changeRoute, {
            database: upCaseDataBase, table: table,
            columns: columns, upCaseColumns: upCaseColumns,
            operation: operation,
            rows: null, errors: errors});
    }
    else {
      const newValues = `price = "${req.body.price}
          ", id_user = "${req.body.id_user}
          ", id_flight = "${req.body.id_flight}
          "`;
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
    const sql = `SELECT * FROM ${table};`;
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
