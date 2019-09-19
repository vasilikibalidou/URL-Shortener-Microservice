'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  originalUrl: String,
  shortUrl: Number
});

const Url = mongoose.model("Url", urlSchema);

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
const urldb = process.env.MONGO_URL
mongoose.connect(process.env.MONGO_URL);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/new/:originalUrl(*)", function(req, res) {
  const originalUrl = req.params.originalUrl;
  const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  
  if(regex.test(originalUrl)) {
    const shortUrl = Math.floor(Math.random()*100000);
      const newUrl = new Url({
        originalUrl: originalUrl,
        shortUrl: shortUrl
      });
      newUrl.save((err,data)=>{if(err) {
        return res.send("Error");
      } return res.json({"original_url": newUrl.originalUrl, "short_url": newUrl.shortUrl});
      });
  } else {
    return res.json({"error": "invalid URL"})
  }
  
});

app.get("/:shortUrl", function(req, res) {
  const shortUrl = req.params.shortUrl;
  
  Url.findOne({shortUrl: shortUrl}, (err,data)=>{if(err) {
        return res.send("Error");
      } 
      const regEx = new RegExp("^(http|https)://","i"); 
      const checkUrl = data.originalUrl;
      if(regEx.test(checkUrl)) {
        res.redirect(data.originalUrl);
      } else {
        res.redirect("http://"+data.originalUrl);
      }
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});