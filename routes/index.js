var router = require('express').Router();
var models = require('../models');
var async = require('async');
var bluebird = require('bluebird');

router.get('/', function (req, res, next){
  // an array of promises (.exec with no cb returns a promise)
  promises = [
    models.Hotel.find({}).exec(),
    models.ThingToDo.find({}).exec(),
    models.Restaurant.find({}).exec()
  ];
  // `.all` waits for all promises to resolve,
  // `.spread` spreads results over parameters
  bluebird.all(promises).spread(function(hotels, things, cafes){
    res.render('index', {
      hotels: hotels,
      thingsToDo: things,
      restaurants: cafes
    });
  }).catch(next); // any errors, pass to next
});

module.exports = router;

// using async parallel with array of functions
// async.parallel([
//   function (cb) { models.Hotel.find({}, cb); },
//   function (cb) { models.ThingToDo.find({}, cb); },
//   function (cb) { models.Restaurant.find({}, cb); }
// ], function (err, results) {
//   if (err) return next(err);
//   res.render('index', {
//     hotels: results[0],
//     thingsToDo: results[1],
//     restaurants: results[2]
//   });
// });

// using async parallel with array of bound functions
// async.parallel([
  // models.Hotel.find.bind(models.Hotel),
  // models.ThingToDo.find.bind(models.ThingToDo),
  // models.Restaurant.find.bind(models.Restaurant)
// ], function (err, results) {
//   if (err) return next(err);
  // res.render('index', {
  //   hotels: results[0],
  //   thingsToDo: results[1],
  //   restaurants: results[2]
  // });
// });

// using async parallel with object
// async.parallel({
//   hotels: function (cb) { models.Hotel.find({}, cb); },
//   things: function (cb) { models.ThingToDo.find({}, cb); },
//   cafes:  function (cb) { models.Restaurant.find({}, cb); }
// }, function (err, result) {
//   if (err) return next(err);
//   res.render('index', {
//     hotels: result.hotels,
//     thingsToDo: result.things,
//     restaurants: result.cafes
//   });
// });
