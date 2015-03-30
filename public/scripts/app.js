$(document).ready(function () {

//map has to be accessible everywhere, so declare here
    var map;

//defined at the bottom, specifies everything about the map 
    initialize_gmaps();

//since we have a multiple dyas in our itirnarary declare it here
    var days = [
        []
    ];

//set the current day
    var currentDay = 1;

    $.ajax({
            type: 'POST',
            url: '/days/',
            data: {number: currentDay},
            success: function (responseData) {
               //console.log(responseData);// console.log(responseData);
        // some code to run when the response comes back
            }
        });

    var $dayHeading = $('#day-title span');
    var $removeDayButton = $('#day-title button');


//adding an item to the Panel2 (itinerary list), adding an item to the 
//certain day and adding a marker on the map
    $('.add-item').on('click', function () {

        var $button = $(this);
        var item = getItemTypeAndText($button);

        //console.log(item.text);

        $.ajax({
            type: 'POST',
            url: '/days/'+currentDay+'/'+item.type,
            data: {item: item.text, currentDay:currentDay},
            success: function (responseData) {
               //console.log(responseData);// console.log(responseData);
        // some code to run when the response comes back
            }
        });

        marker = addItemToMap(item);
        addItemToDay(item, marker);
        addItemToChosenList(item);

        setMapBounds();

    });

//removing items from the Panel 2, removing items from the certain day's 
//itirnarary list and removing the marker
    $('.chosen-group').on('click', '.remove', function () {
        var $item = $(this).parent().parent();
        //console.log($item.prev().text());
        
            var messy = ($item.prev().text());
        var type;

            if(messy === "My Things To Do") {
                type = "thingsToDo";
            }else if(messy === "My Hotel") {
                type = "hotel";
            } else if(messy === "My Restaurants") {
                type = "restaurant";
            }
    
        var name = $item.find('.title').text();
        //console.log(name);

        $.ajax({
            type: "DELETE",
            url: "/days/" + currentDay + "/" + type +"/",
            data: {name: name, currentDay: currentDay},
            success: function (responseData) {
               //console.log(responseData);// console.log(responseData);
        // some code to run when the response comes back
            }

        });
        
        $item.remove();
        removeItemFromDay(name);
        setMapBounds();
    });


// adding new days to our itirnarary list and pushing them into the days array
    $('.add-day-btn').on('click', function () {

        var $addButton = $(this);
        var currentNumberOfDays = $addButton.siblings().length;
        //console.log(currentNumberOfDays);
        var $newDayButton = $(createDayButton(currentNumberOfDays + 1));

        $addButton.before($newDayButton);
        days.push([]);

        $newDayButton.trigger('click');
        $.ajax({
            type: 'POST',
            url: '/days',
            data: {number: currentNumberOfDays+1},
            success: function (responseData) {
                console.log(responseData);
        // some code to run when the response comes back
            }
        });

    });


//switching between the days
    $('.day-buttons').on('click', '.select-day', function () {

        var previousDay = currentDay;
        var thisDay = $(this).text();
        if (previousDay === thisDay) return;

        currentDay = thisDay;
        $(this).addClass('current-day').siblings().removeClass('current-day');
        $dayHeading.text('Day ' + thisDay);

        removeDayMarkers(previousDay);
        $('.chosen-group').find('.list-group').empty();

        insertDayMarkers(thisDay);
        insertDayItineraryItems(thisDay);

        setMapBounds();

    });


//removing the days and reseting the current day to 1
    $removeDayButton.on('click', function () {

        removeDayMarkers(currentDay);
        days.splice(currentDay - 1, 1);

        $('.select-day').eq(currentDay - 1).remove();

        $('.select-day').each(function (index) {
            $(this).text(index + 1);
        });

        currentDay = 1;
        $('.select-day').eq(0).trigger('click');

        setMapBounds();

    });





//setting the map bounds
    function setMapBounds() {

        var bounds = new google.maps.LatLngBounds();

        var dayItems = days[currentDay - 1];

        dayItems.forEach(function (item) {
            bounds.extend(item.marker.position);
        });

        map.fitBounds(bounds);

    }

//removing the markers for days that are removed
    function removeDayMarkers(dayNumber) {

        var dayItems = days[dayNumber - 1];

        dayItems.forEach(function (item) {
            item.marker.setMap(null);
        });

    }

//
    function insertDayItineraryItems(dayNumber) {

        var dayItems = days[dayNumber - 1];

        dayItems.forEach(function (item) {
            addItemToChosenList(item.item);
        });

    }

// setting markers to appear for the chosen day
    function insertDayMarkers(dayNumber) {

        var dayItems = days[dayNumber - 1];

        dayItems.forEach(function (item) {
            item.marker.setMap(map);
        });

    }


//returns an array with an object that contains an item and a marker relative to 
//a specific day
    function addItemToDay(item, marker) {
        var day = days[currentDay - 1];
        day.push({ item: item, marker: marker });
    }

//finds a day and matches the name of the item that should be removed after the
//remove button is clicked and removes markers as well
    function removeItemFromDay(name) {

        var dayItems = days[currentDay - 1];

        var item = dayItems.filter(function (item) {
            return item.item.text === name;
        })[0];

        var index = dayItems.indexOf(item);

        dayItems.splice(index, 1);

        item.marker.setMap(null);

    }

//includes functions that define markers and return the marker
    function addItemToMap(item) {

        var lngLat = getLngLat(item);
        var icon = getIconByType(item.type);
        var marker = drawLocation(lngLat, {icon: 'images/' + icon});

        return marker;

    }

// matches the right icon for the marker depending on the type
    function getIconByType(type) {
        switch (type) {
            case 'hotel':
                return 'lodging_0star.png';
            case 'restaurant':
                return 'restaurant.png';
            case 'activity':
                return 'star-3.png';
        }
    }

// extracts the info from the data about the coordinates
    function getLngLat(item) {

        var typeToCollectionDict = {
            'hotel': all_hotels,
            'restaurant': all_restaurants,
            'activity': all_things_to_do
        };

        var collection = typeToCollectionDict[item.type];

        var itemInCollection = collection.filter(function (collectionItem) {
            return collectionItem.name === item.text;
        })[0];

        var locationData = itemInCollection.place[0].location;

        return locationData;

    }

//returns an object {type, text} that contains the info about what is to be manipulated
//based on which button was pressed
    function getItemTypeAndText($button) {

        var $grouping = $button.parent();
        var itemGroup = $grouping.attr('id').split('-')[0];

        var $select = $button.siblings('select');
        var itemText = $select.val();

        return {
            type: itemGroup,
            text: itemText
        };

    }

// based on the type (hotel, restaurant, thingToDo) returns the html id it belongs to
    function matchListToType(type) {
        switch (type) {
            case 'hotel':
                return '#chosen-hotels';
            case 'restaurant':
                return '#chosen-restaurants';
            case 'activity':
                return '#chosen-activities';
        }
    }

// when the add button is pressed it finds the place where it should be appended
//to in html and calls a function that is supposed to do it
    function addItemToChosenList(item) {

        var listContainerId = matchListToType(item.type);
        var $chosenListContainer = $(listContainerId);

        $chosenListContainer.find('ul').append(createItineraryItem(item));

    }

// returns a html tags that specify where exactly the newly added item 
//should be appended to
    function createItineraryItem(item) {

        var html = '<div class="itinerary-item">' +
            '<span class="title">' + item.text + '</span>' +
            '<button class="btn btn-xs btn-danger remove btn-circle">x</button>' +
            '</div>';

        return $(html);

    }

// a function that haas all the definitions regarding the map (map, latLng, style..)
    function initialize_gmaps() {
        var styleArr = [
            {
                'featureType': 'landscape',
                'stylers': [
                    {'saturation': -100},
                    {'lightness': 60}
                ]
            },
            {
                'featureType': 'road.local',
                'stylers': [
                    {'saturation': -100},
                    {'lightness': 40},
                    {'visibility': 'on'}
                ]
            },
            {
                'featureType': 'transit',
                'stylers': [
                    {'saturation': -100},
                    {'visibility': 'simplified'}
                ]
            },
            {
                'featureType': 'administrative.province',
                'stylers': [
                    {'visibility': 'off'}
                ]
            },
            {
                'featureType': 'water',
                'stylers': [
                    {'visibility': 'on'},
                    {'lightness': 30}
                ]
            },
            {
                'featureType': 'road.highway',
                'elementType': 'geometry.fill',
                'stylers': [
                    {'color': '#ef8c25'},
                    {'lightness': 40}
                ]
            },
            {
                'featureType': 'road.highway',
                'elementType': 'geometry.stroke',
                'stylers': [
                    {'visibility': 'off'}
                ]
            },
            {
                'featureType': 'poi.park',
                'elementType': 'geometry.fill',
                'stylers': [
                    {'color': '#b6c54c'},
                    {'lightness': 40},
                    {'saturation': -40}
                ]
            }
        ];
        // initialize new google maps LatLng object
        var myLatlng = new google.maps.LatLng(40.705189, -74.009209);
        // set the map options hash
        var mapOptions = {
            center: myLatlng,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: styleArr
        };
        // get the maps div's HTML obj
        var map_canvas_obj = document.getElementById("map-canvas");
        // initialize a new Google Map with the options
        map = new google.maps.Map(map_canvas_obj, mapOptions);
    }

// returns a marker with the place it to be placed
    function drawLocation(location, opts) {
        if (typeof opts !== 'object') opts = {};
        opts.position = new google.maps.LatLng(location[0], location[1]);
        opts.map = map;
        var marker = new google.maps.Marker(opts);
        return marker;
    }


// returns html tags that specify where the new day should be added to html
//when created and added.
    function createDayButton(dayNumber) {
        var html = '<button class="btn btn-circle day-btn select-day">'
                      + dayNumber +
                   '</button>';
        return html;
    }


});