const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
	extended: true,
}));
app.use(cors());

// Start server.
app.listen(port);
