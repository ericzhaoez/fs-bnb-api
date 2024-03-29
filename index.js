const express = require("express")

const fs = require("fs");

const app = express();

const constants = require("./constants");
// console.log(constants);

const ValidationService = require("./validation-service");
// const valServ = new ValidationService();
// console.log(valServ);
// console.log(ValidationService);

app.use(express.json());
app.use(express.urlencoded({ extended:false}));

var users = new Array();
var properties = new Array();
var bookings = new Array();

var mysqlConn = require("./db");

app.post("/read/file", (req, res) => {
    fs.readFile("./data/file.json", function(err, data) {
        if (err) {
            return res.status(500).json({message: "Unable to open the file"});
        }

        var jsonFromString = JSON.parse(data);
        jsonFromString.users.push({id: 1});
        fs.writeFile("./data/file.json", JSON.stringify(jsonFromString), function(err) {
            if (err) {
                return res.status(500).json({message: "Unable to write the file"});
            }
            return res.status(200).json(data);
        });

    });
});

// 1. to register a new user at POST api/users and find user information at GET api/user/:id
app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;

    const numberUserId = parseInt(userId);
    // console.log(numberUserId);
    if(isNaN(userId)) {
        return res.status(400).json({message: "I am expecting an integer"});
    }

    if (!userId) {
        return res.status(400).json({message: "Please pass in a userId"});
    }
    for (var k = 0; k < users.length; k++) {
        const aUser = users[k];
        if (aUser.id == userId) {
            return res.status(200).json(aUser);
        }
    }

    return res.status(404).json({message: "User not found"});
});

app.post("/api/users", (req, res) => {
    const user = req.body;
    const bodyFirstname = user.firstname;
    const bodyLastname = user.lastname;
    const bodyEmail = user.email;
    const bodyPassword = user.password;

    var errors = [];
    if (!bodyFirstname) {
        errors.push({message: "Invalid firstname"});
    }
    if (!bodyLastname) {
        errors.push({message: "Invalid lastname"});
    }
    if (!bodyEmail) {
        errors.push({message: "Invalid email"});
    }
    if (!bodyPassword) {
        errors.push({message: "Invalid password"});
        // return res.status(400).json({message: "Invalid request"});
    }

    if (errors.length > 0){
        return res.status(400).json({errorMessages: errors});
    }

    //functional form to detect email duplicates 

    // let foundUser = null;
    // users.forEach((aUser) => {
    //     if (aUser.email === bodyEmail) {
    //         foundUser = aUser;
    //     }
    // });
    // if (foundUser != null) {
    //     return res.status(400).json({message: "User exists with that email"});
    // }

    // standard form to detect email duplicates

    for (var k = 0; k < users.length; k++) {
        const aUser = users[k];
        if (aUser.email === bodyEmail) {
            return res.status(400).json({message: "User exists with that email"});
        }

    }

    var newUser = {
        id: users.length + 1,
        firstname: bodyFirstname,
        lastname: bodyLastname,
        email: bodyEmail,
        password: bodyPassword,
    };

    users.push(newUser);

    res.json(newUser);
});

// 2. to verify a user login at POST api/users/authentication
app.post("/api/users/authentication", (req, res) => {
    const user = req.body;
    const bodyEmail = user.email;
    const bodyPassword = user.password;

    var errors = [];
    if (!bodyEmail) {
        errors.push({message: "Invalid email"});
    }
    if (!bodyPassword) {
        errors.push({message: "Invalid password"});
        // return res.status(400).json({message: "Invalid request"});
    }

    if (errors.length > 0){
        return res.status(400).json({errorMessages: errors});
    }

    for (var k = 0; k < users.length; k++) {
        const authUser = users[k];
        if (authUser.email === bodyEmail &&
            authUser.password === bodyPassword) {
                return res.status(200).json(authUser);
        }
        else if (authUser.email !== bodyEmail ||
                authUser.password !== bodyPassword) {
                    return res.status(400).json({message: "Invalid username or password"})
                }

    }

});

// 3. creating a new property at POST api/properties
app.post("/api/properties", (req, res) => {
    const property = req.body;
    const bodyName = property.name;
    const bodyLocation = property.location;
    const bodyImageUrl = property.imageUrl;
    const bodyPrice = property.price;

    var errors = [];
    if (!bodyName) {
        errors.push({message: "Invalid name"});
    }
    if (!bodyLocation) {
        errors.push({message: "Invalid location"});
    }
    if (!bodyImageUrl) {
        errors.push({message: "Invalid image"});
    }
    if (!bodyPrice) {
        errors.push({message: "Invalid price"});
    }

    if (errors.length > 0){
        return res.status(400).json({errorMessages: errors});
    }

    var newProperty = {
        id: properties.length + 1,
        name: bodyName,
        location: bodyLocation,
        imageUrl: bodyImageUrl,
        price: bodyPrice,
    };

    properties.push(newProperty);

    res.json(newProperty);

});

// 4. find property by ID at GET api/properties/:id
app.get("/api/properties/:id", (req, res) => {
    const propertyId = req.params.id;

    const numberPropertyId = parseInt(propertyId);
    // console.log(numberPropertyId);
    if(isNaN(propertyId)) {
        return res.status(400).json({message: "I am expecting an integer"});
    }

    if (!propertyId) {
        return res.status(400).json({message: "Please pass in a propertyId"});
    }
    for (var k = 0; k < properties.length; k++) {
        const aProperty = properties[k];
        if (aProperty.id == propertyId) {
            return res.status(200).json(aProperty);
        }
    }

    return res.status(404).json({message: "Property not found"});
});

// 5. delete property by ID using array.splice method at DELETE api.properties/:id
app.delete("/api/properties/:id", (req, res) => {
    const propertyId = req.params.id;

    const numberPropertyId = parseInt(propertyId);
    // console.log(numberPropertyId);
    if(isNaN(propertyId)) {
        return res.status(400).json({message: "I am expecting an integer"});
    }

    if (!propertyId) {
        return res.status(400).json({message: "Please pass in a userId"});
    }
    for (var k = 0; k < properties.length; k++) {
        const delProperty = properties[k];
        if (delProperty.id == propertyId) {
            properties.splice(k, 1)
            return res.status(200).json({message: "Property deleted"});
        }
    }

    return res.status(404).json({message: "Property not found"});
});

// 6. create a new booking request at POST properties/:id/bookings
app.post("/api/properties/:id/bookings", (req, res) => {
    const booking = req.body;
    const bodyDateFrom = booking.dateFrom;
    const bodyDateTo = booking.dateTo;
    const bodyUserId = booking.userId;
    const bodyPropertyId = req.params.id;
    const propertyId = req.params.id;
    const bodyStatus = booking.status;

    var errors = [];
    if (!bodyDateFrom) {
        errors.push({message: "Invalid start date"});
    }
    if (!bodyDateTo) {
        errors.push({message: "Invalid end date"});
    }
    if (!bodyUserId) {
        errors.push({message: "Invalid user"});
    }

    if (errors.length > 0){
        return res.status(400).json({errorMessages: errors});
    }

    if (!propertyId) {
        return res.status(400).json({message: "Please pass in a propertyId"});
    }
    let foundProperty = null;
    for (var k = 0; k < properties.length; k++) {
        const bookProperty = properties[k];
        if (bookProperty.id == propertyId) {
            foundProperty = bookProperty;
        }
    }
    if (!foundProperty) {
        return res.status(404).json({message: "Property not found"});
    }

    var newBooking = {
        id: bookings.length + 1,
        dateFrom: bodyDateFrom,
        dateTo: bodyDateTo,
        userId: bodyUserId,
        propertyId: bodyPropertyId,
        status: "NEW",
    };

    bookings.push(newBooking);

    res.json(newBooking);

});

// 7. find property booking by ID at GET api/properties/:id/bookings
app.get("/api/properties/:id/bookings", (req, res) => {
    // const bookPropertyId = req.params.id;
    const propertyId = req.params.id;
    // const bodyPropertyId = req.params.id;
    var specificBookings = [];

    const numberPropertyId = parseInt(propertyId);
    // console.log(propertyId);
    if(isNaN(propertyId)) {
        return res.status(400).json({message: "I am expecting an integer"});
    }

    if (!propertyId) {
        return res.status(400).json({message: "Please pass in a booking propertyId"});
    }
// this code will push only the bookings for this property to a new array called specificBookings
    if (bookings.length > 0) {
        foundBooking = null;
        bookings.forEach(existingBooking => {
            if (existingBooking.propertyId == propertyId) {
                foundBooking = true;
                specificBookings.push(existingBooking);
            }
        });
    }
// this code will match up the property ID with the bookings under that property and return them as an array
    let foundProperty = null;
    for (var k = 0; k < bookings.length; k++) {
        const bookProperty = bookings[k];
        if (bookProperty.propertyId == propertyId) {
            foundProperty = bookProperty;
            return res.status(200).json({specificBookings});
        }
    }
    if (!foundProperty) {
    return res.status(404).json({message: "Bookings not found under this property"});
    }
});

const PropertyRouter = express.Router();
PropertyRouter.post("/api/properties", (req, res) => {
    res.send("POST Properties api");
});

app.use("/parent", PropertyRouter);
// POST /parent/api/properties

app.post("/api/auth", (req, res) => {
    res.send("POST Auth api");
});

app.listen(3000, () => {
    console.log("Server is running");
});
