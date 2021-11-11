var express = require("express");
var cors = require("cors");
const cron = require("node-cron")
var app = express();
var Transmission = require("transmission-promise");
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
const fs = require('fs-extra');

require("dotenv").config();
var TRANSMISSION_STATUS_SEED = 6

const transmission = new Transmission({
  host: process.env.TRANSMISSION_HOST,
  port: process.env.TRANSMISSION_PORT,
  username: process.env.TRANSMISSION_USER,
  password: process.env.TRANSMISSION_PASSWORD,
  ssl: false,
  url: process.env.TRANSMISSION_URL_RPC
});
cron.schedule("*/5 * * * *", () => {
  console.log('Running transmission delete torrents');
  transmission.get().then(res => {
    for (const torrent of res.torrents) {
      console.log("Looking status of " + torrent.name + " / Status: " + torrent.status)
      if (torrent.status === TRANSMISSION_STATUS_SEED) {
        console.log("Torrent" + torrent.name + "is FINISH and needs moving to another folder");
        // moveTorrentFinished(torrent.name);
        transmission.remove(torrent.id).then(() => {
          console.log(`${torrent.name} removed!`)
        })
      }
    }
  }).catch(err => console.error(err))
})

function deleteSlashFromFile(fileWithSlashs) {
  var n = fileWithSlashs.lastIndexOf('/');
  return fileWithSlashs.substring(n + 1);
}

function moveTorrentFinished(name) {
  console.log("Moving the file or folder")
  var file = deleteSlashFromFile(name);
  var from = '/downloads/' + file;
  var to = '/downloaded/' + file;
  moveFile(from, to);
}

function moveFile(origin, destiny) {
  console.log('Moving ' + origin + ' to ' + destiny + '.');
  fs.move(origin, destiny, function (err) {
    if (err) throw err;
    console.log('Move ' + origin + ' to ' + destiny + ' complete.');
  });
}


app.listen(process.env.HTTP_PORT, () =>
  console.log("App listening on port " + process.env.HTTP_PORT)
);
