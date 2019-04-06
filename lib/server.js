const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

const routes = require("./routes");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
	extended: true,
}));
app.use(cors());

// Include API routes.
routes(app);

// Start server.
app.listen(port);
