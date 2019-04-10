const express = require('express');
const countries = require('../modules/countries');

const router = express.Router();

// Some information for queries
const table = 'flights';

// Some information for UI
const columns = ['#', 'toPlace', 'fromPlace', 'departure_date', 'rating'];
const upCaseColumns = ['id', 'To Place', 'From Place', 'Departure date', 'Rating'];
const ratingOptions = ['NULL', '1', '2', '3', '4', '5'];

// Some information for routing
const changeRoute = 'change/flights';

// Some validation information
const toPlaceMax = 50;

// Some validation messages
msgToPlaceNotEmpty = "To Place is required!";
msgToPlaceMax = `To place must contain not more than ${toPlaceMax} symbols!`;
msgToPlaceAsciiOnly = 'To place may contain only ASCII symbols!';

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
      operation: operation, ratingOptions: ratingOptions,
      rows: null, errors: null});

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
              operation: operation, ratingOptions: ratingOptions,
              rows: rows, errors: null});
      }
  });

});

function validateRequest(req) {

  req.check('toPlace')
      .trim()
      .notEmpty().withMessage(msgToPlaceNotEmpty)
      .isLength({ max: toPlaceMax }).withMessage(msgToPlaceMax)
      .isAscii().withMessage(msgToPlaceAsciiOnly);

  req.check('fromPlace')
      .trim()
      .notEmpty().withMessage(msgToPlaceNotEmpty)
      .isLength({ max: toPlaceMax }).withMessage(msgToPlaceMax)
      .isAscii().withMessage(msgToPlaceAsciiOnly);

  req.check('departure_date')
      .trim()
      .notEmpty().withMessage(msgToPlaceNotEmpty)
      .isLength({ max: toPlaceMax }).withMessage(msgToPlaceMax)
      .isAscii().withMessage(msgToPlaceAsciiOnly);

  return req.validationErrors();

}

router.post('/save', urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(BAD_REQUEST).render(changeRoute, {
            database: upCaseDataBase, table: table,
            columns: columns, upCaseColumns: upCaseColumns,
            operation: operation, ratingOptions: ratingOptions,
            rows: null, errors: errors});
    }
    else {
      if (req.body.rating != 'NULL') {
          req.body.rating = `"${req.body.rating}"`;
      }
      const newValues = `toPlace = "${req.body.toPlace}
          ", fromPlace = "${req.body.fromPlace}
          ", departure_date = "${req.body.departure_date}
          ", rating = ${req.body.rating}`;
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
    const sql = `SELECT * FROM ${table} ORDER BY fromPlace ASC, rating DESC;`;
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
