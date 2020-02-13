// Dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const mongojs = require("mongojs");
const mongoose = require("mongoose");
const logger = require("morgan");
const axios = require("axios");
const cheerio = require("cheerio");

let PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();
const db = require("./models");
app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json);
app.use(express.static("public"));
app.engine("handlebars", exphbs());
app.set("view engine", 'handlebars');

mongoose.connect("mongodb://localhost/NewsScraper", { useNewUrlParser: true });

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
  res.render("index");
});

// Retrieve data from the db
app.get("/all", function (req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function (error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.ycombinator.com/").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".title").each(function (i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link
        },
          function (err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 8080
app.listen(PORT, function () {
  console.log("App running on port: " + PORT);
});
