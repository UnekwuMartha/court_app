const express = require("express");
const app = express();
const mongoose = require('mongoose');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const fs = require("fs");
const multer = require("multer");
const {
  Admin
} = require("mongodb");
var Publishable_Key = 'pk_test_51MVlZJJhY0CabdhzBpPKdJEbzz54pYtJ3SZLcV1s3cX7zh5BVvBWKH8w48S1GwLLIq7GfDIub04EVt4MrxDQ5hGX00uTjncX7k'
var Secret_Key = 'sk_test_51MVlZJJhY0CabdhzT5jP6m5pNCNUVICpS7Bgc8mdpJmnffqpyfn21shW4sfDBPeb54S85HcpwMwAAh8wt6s72XXo00kbKY53jw'

const stripe = require('stripe')(Secret_Key)


//database connection
dbUrl = 'mongodb://localhost:27017/courtDB'
mongoose.connect(dbUrl, (err) => {
  console.log('mongodb connected', err);
})


//setting view engine to use ejs instead of html
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(bodyParser.json())
app.use(express.static("public"));

//route for login page
app.get("/", function (req, res) {
  res.render("login");
})

app.post('/', function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if(email === 'admin@court.com' && password === 'admin'){
    User.find({}, (err, users) => {
      res.render("admin_log", {
        users: users
      });
    })
  } else {
    res.redirect('/homepage')
  }
})


//route for home page
app.get("/homepage", function (req, res) {
  return res.render("homepage");
})

app.post("/homepage", function (req, res) {
  res.render("homepage");
});

//route for admin case logs
app.get("/admin_log", function (req, res) {
  res.render("admin_log");
});

//route for filing page
app.get("/chat", function (req, res) {
  res.render('chat');
})

//for real time chat
io.on('connection', () => {
  console.log('a user is connected')
})

//to store messages in database
var Message = mongoose.model("Message", {
  message: String
})
app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})

//to get previous messages
app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})

//to get previous messages
app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) => {
    if (err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})


// Set storage engine for file upload
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//to store client details in database
var detailSchema = new mongoose.Schema({
  name: String,
  case_type: String,
  description: String,
  number: Number
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

//for admin to view all the cases
app.get("/details", (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
    } else {
      res.render("admin_log", {
        users: users
      });
    }
  });
});

// Initialize upload of files
const upload = multer({
  storage: storage
}).single('file');

// Create a new schema for the file to be abe to store files in database
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


//to handle payment page
app.get("/payment", function (req, res) {
  res.render('payment', {
    key: Publishable_Key
  })
});


//to accept payment
app.post('/payment', function (req, res) {
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
      res.render("success") // If no error occurs
    })
    .catch((err) => {
      res.render("failure") // If some error occurs
    });
})

//server connection
http.listen(3000, function () {
  console.log("Server is running on port 3000 ");
});