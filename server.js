const express = require("express");
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const fs = require("fs");
const multer = require("multer");
var Publishable_Key = 'pk_test_51MVlZJJhY0CabdhzBpPKdJEbzz54pYtJ3SZLcV1s3cX7zh5BVvBWKH8w48S1GwLLIq7GfDIub04EVt4MrxDQ5hGX00uTjncX7k'
var Secret_Key = 'sk_test_51MVlZJJhY0CabdhzT5jP6m5pNCNUVICpS7Bgc8mdpJmnffqpyfn21shW4sfDBPeb54S85HcpwMwAAh8wt6s72XXo00kbKY53jw'
 
const stripe = require('stripe')(Secret_Key)
//database connection
dbUrl = 'mongodb://localhost:27017/courtsDB'
mongoose.connect(dbUrl, (err) => {
  console.log('mongodb connected', err);
})

io.on('connection', (socket) => {
  console.log('a user is connected')
})

var Message = mongoose.model('Message', {message: String})

//setting view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(express.static("public"));

//route for login page
app.get("/", function (req, res) {
  return res.render("login");
  let email = req.body.email;
  console.log(email)
  return res.redirect("/homepage");
  // if (email.includes("admin@court.com")) {
  //   res.redirect("/admin_log");
  // } else {
  //   res.redirect("/homepage");
  // }
});

//route for home page
app.get("/homepage", function (req, res) {
  res.render("homepage");
});

app.post("/homepage", function (req, res) {
  res.render("homepage");
});

app.get("/chat", function (req, res) {
    res.render('chat'); 
})

app.get('/chat/messages', (req, res) => {
  Message.find({}, (err, messages)=> {
    res.send(messages);
  })
})

app.post('/chat/messages', (req, res) => {
  var message = new Message(req.body.input);
      message.save((err) =>{
        if(err)
          sendStatus(500);
          socket.emit('message', req.body.input)
          socket.broadcast('message', req.body.input)
        })
        res.sendStatus(200);
      })

// Set storage engine for file upload
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


var detailSchema = new mongoose.Schema({
  name: String,
  case_type: String,
  description: String
});
var User = mongoose.model("User", detailSchema);

//details form
app.post('/details', function (req, res) {
  var myData = new User(req.body);
  myData.save()
    .then(item => {
      res.render("success")
    })
    .catch(err => {
      res.render("failure")
    });
  return res.redirect('/chat');
})

// Initialize upload
const upload = multer({
  storage: storage
}).single('file');

// Create a new schema for the file
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
  }
});

// Create a new model using the schema
const File = mongoose.model('File', fileSchema);

// Handle file upload
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send(err);
    } else {
      if (req.file === undefined) {
        res.send('Error: No File Selected!');
      } else {
        // Save the file information to the database
        let file = new File({
          name: req.file.originalname,
          file: req.file.filename
        });
        file.save()
          .then(file => {
            res.render("success")
            
          })
          .catch(err => {
            res.render("failure")
          });
      }
    }
  });
});

app.get("/payment", function (req, res) {
  res.render('payment', {
    key: Publishable_Key
 })
});
 
app.post('/payment', function(req, res){
 
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Ahmed Isah',
        address: {
            line1: 'No 4, Chanchaga',
            postal_code: '452331',
            city: 'IMinna',
            state: 'Niger',
            country: 'Nigeria',
        }
    })
    .then((customer) => {
 
        return stripe.charges.create({
            amount: 2500000,
            description: 'Debt Case',
            currency: 'ngn',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.render("success")  // If no error occurs
    })
    .catch((err) => {
        res.render("failure")       // If some error occurs
    });
})

app.listen(3000, function () {
  console.log("Server is running on port 3000 ");
});