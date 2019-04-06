const mtaGtfs = require("mta-gtfs");

const config = require("../../config/config.json");
const arrivalTimes = require("./arrival-times");
const serviceStatus = require("./service-status");

const mtaApiKey = config["mtaApiKey"];

let mta = new mtaGtfs({
	key: mtaApiKey,
});

let params = {
	mta,
};

module.exports = (app) => {
	arrivalTimes(app, params);
	serviceStatus(app, params);
};
