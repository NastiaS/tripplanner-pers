var dayRouter = require('express').Router();
var attractionRouter = require('express').Router();
var models = require('../models');





dayRouter.get('/', function (req, res, next) {
     models.Day.find({}, function (err, days) {
        res.json(days);
        console.log(days);
   });
});
// POST /days
dayRouter.post('/', function (req, res, next) {
    models.Day.create(req.body, function(err, day){
        if(err) return next(err);
        //this will take care of the no-body case
        res.json(day);
    });
});


// GET /days/:id
dayRouter.get('/:id', function (req, res, next) {
    // serves a particular day as json
    models.Day.findOne({number: req.params.id}, function(err, day) {
        if(err) return next(err);
        //this will take care of the no-body case
        res.json(day);
    })
});
// DELETE /days/:id
dayRouter.delete('/:id', function (req, res, next) {
    console.log("got here");
    models.Day.findByIdAndRemove(req.params.id, function(err, data){
        console.log("DELETED!");

    });
    // deletes a particular day
    
});

dayRouter.use('/:id', attractionRouter);
// POST /days/:id/hotel
attractionRouter.post('/hotel', function (req, res, next) {
    // creates a reference to the hotel
    //console.log("Got here");
    var hotel_id;
    models.Hotel.findOne({name: req.body.item}, function(err, hotel) {
        //console.log(hotel);
        hotel_id = hotel._id;
        models.Day.findOneAndUpdate( {number: req.body.currentDay}, { $set: { hotel: hotel_id }}, function(err, day){
            console.log("This the data" + day);
            res.json(day);
        }); 

    });

});
// DELETE /days/:id/hotel
attractionRouter.delete('/hotel', function (req, res, next) {
    console.log(req.body)
    // models.Day.findByIdAndRemove(req.params.id, function(err, data){
    //     console.log("DELETED!");

    // });
    var hotel_id;
    models.Hotel.findOne({name: req.body.name}, function(err, hotel) {
        //console.log(hotel);
        hotel_id = hotel._id;
        models.Day.remove( { hotel: hotel_id }, function(err){
            //console.log("This is the day erased" + day);
            //res.json(day);
        }); 

    });
});// POST /days/:id/restaurants



attractionRouter.post('/restaurant', function (req, res, next) {
    var restaurant_id;
    models.Restaurant.findOne({name: req.body.item}, function(err, restaurant){
        restaurant_id = restaurant._id;
        models.Day.findOneAndUpdate( {number: req.body.currentDay}, { $push: { restaurant: restaurant_id }}, function(err, day){
            console.log("restaurant!" + day);
            res.json(day);
    });
});

});
// DELETE /days/:dayId/restaurants/:restId
attractionRouter.delete('/restaurant/:id', function (req, res, next) {
    // deletes a reference to a restaurant
});
// POST /days/:id/thingsToDo
attractionRouter.post('/activity', function (req, res, next) {
    var thingToDo_id;
    models.ThingToDo.findOne({name: req.body.item}, function(err, thingToDo){
        thingToDo_id = thingToDo._id;
        models.Day.findOneAndUpdate( {number: req.body.currentDay}, { $push: { ThingToDo: thingToDo_id }}, function(err, day){
            console.log(day);
            res.json(day);
    });
});

});
// DELETE /days/:dayId/thingsToDo/:thingId
attractionRouter.delete('/thingsToDo/:id', function (req, res, next) {
    // deletes a reference to a thing to do
});


module.exports =  dayRouter;
