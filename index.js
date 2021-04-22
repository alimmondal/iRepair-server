const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj8zc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("completeWebsite").collection("addServices");
  const appointmentCollection = client.db("iRepair").collection("appointments");
  const reviewCollection = client.db("completeReviews").collection("review");
  console.log('db connected')


  app.post('/addAppointments', (req, res) => {
    const appointment = req.body;
    console.log('appointments',appointment);
    appointmentCollection.insertOne(appointment)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })


  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;
    serviceCollection.find({email: email})
    .toArray((err, admin) => {
      const filter = {date: date.date}
      if(admin.length === 0){
        filter.email =email;
      }

    appointmentCollection.find(filter)
    .toArray((err, documents) => {
      res.send(documents)
    })
    })
  })


  app.post('/addAnAdmin', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name, email, file);

    file.mv(`${__dirname}/doctors/${file.name}`, err =>{
      if(err){
        console.log(err);
        return res.status(500).send({msg: 'failed to fetch'})
      }
      return res.send({name: file.name, path: `/${file.name}`})
    })
    
    
})

  app.get('/services', (req, res) => {
    serviceCollection.find()
    .toArray((err, items) => {
      res.send(items);
      // console.log('from database', items) 
    })
  })

  app.post('/addServices', (req, res) => {
    const newService = req.body;
    // console.log('adding product', newService)
    serviceCollection.insertOne(newService)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    serviceCollection.find({email: email})
    .toArray((err, admin) => {
      res.send(admin.length > 0);
  
    })
  })


  app.get('/reviews', (req, res) => {
    reviewCollection.find()
    .toArray((err, reviews) => {
      res.send(reviews);
      console.log('from database', reviews) 
    })
  })

  app.post('/addReviews', (req, res) => {
    const newReviews = req.body;
    console.log('adding review', newReviews)
    reviewCollection.insertOne(newReviews)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })


});





app.listen(process.env.PORT || port)