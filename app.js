import { createRequire } from "module";
const require = createRequire(import.meta.url);

const express = require("express");
import { readFile, writeFile } from "fs/promises";

var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  req.method === "OPTIONS" ? res.sendStatus(200) : next();
};
const app = express();
const port = 8080;
app.use(allowCrossDomain);

app.get("/accept/:guest_name", async (req, res) => {
  var guest_name = req.params.guest_name;
  let rsvps = JSON.parse(await readFile("rsvps.json", "utf8"));

  const isAlreadyAccepted = rsvps?.accepted?.some(
    (acceptedGuest) => acceptedGuest === guest_name
  );

  if (isAlreadyAccepted) {
    return res.sendStatus(200);
  }

  let updatedRSVPS = {
    ...rsvps,
    accepted: [...rsvps.accepted, guest_name],
    denied: rsvps.denied.filter((deniedGuest) => deniedGuest !== guest_name),
  };

  writeFile("rsvps.json", JSON.stringify(updatedRSVPS))
    .then(() => {
      console.log("Update Success");
    })
    .catch((err) => {
      console.log("Update Failed: " + err);
    });
  res.sendStatus(200);
});

app.get("/deny/:guest_name", async (req, res) => {
  var guest_name = req.params.guest_name;
  let rsvps = JSON.parse(await readFile("rsvps.json", "utf8"));
  const isAlreadyDenied = rsvps?.denied?.some(
    (deniedGuest) => deniedGuest === guest_name
  );

  if (isAlreadyDenied) {
    return res.sendStatus(200);
  }

  let updatedRSVPS = {
    ...rsvps,
    denied: [...rsvps.denied, guest_name],
    accepted: rsvps.accepted.filter(
      (acceptedGuest) => acceptedGuest !== guest_name
    ),
  };

  writeFile("rsvps.json", JSON.stringify(updatedRSVPS))
    .then(() => {
      console.log("Update Success");
    })
    .catch((err) => {
      console.log("Update Failed: " + err);
    });
  res.sendStatus(200);
});

app.get("/", async (req, res) => {
  let rsvps = JSON.parse(await readFile("rsvps.json", "utf8"));
  res.status(200).json(rsvps);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
