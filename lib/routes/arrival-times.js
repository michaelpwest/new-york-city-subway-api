module.exports = (app, params) => {
	const _ = require("lodash");
	const moment = require("moment");

	const feeds = require("../resources/feeds.json");
	const routes = require("../resources/routes.json");
	const stations = require("../resources/stations.json");

	const mta = params.mta;

	// Return error if no arrival times station is specified.
	app.get("/arrival-times", async(req, res) => {
		res.status(500).send("No station specified");
	});

	// Arrival times for a station.
	app.get("/arrival-times/:station", async(req, res) => {
		try {
			const stationParam = req.params.station;

			// Find station based on GTFS stop ID in stations.json.
			const station = stations.filter(value => {
				return value.stop == stationParam;
			});
			if (!station.length) {
				throw new Error("Invalid station specified.");
			}

			// Find station routes.
			const stationRoutes = station[0].routes;

			// Find feed IDs from feeds.json, based on station routes.
			let feedIds = feeds.filter(value => {
				return _.intersection(value.routes, stationRoutes).length;
			});
			if (!feedIds.length) {
				throw new Error("Invalid feed.");
			}

			const arrivalTimes = {
				timestamp: moment().unix(),
				directions: {
					N: {
						name: "",
						arrivalTimes: [],
					},
					S: {
						name: "",
						arrivalTimes: [],
					},
				},
			};

			for (const i in feedIds) {
				// Get current arrival times for station.
				const response = await mta.schedule(stationParam, feedIds[i].feed);
				if (!Object.keys(response).length) {
					continue;
				}
				["N", "S"].forEach((direction) => {
					arrivalTimes.directions[direction].arrivalTimes = arrivalTimes.directions[direction].arrivalTimes.concat(response.schedule[stationParam][direction]);
				});
			}

			// Get first result's route to use for uptown / downtown name.
			const route = routes.filter(value => {
				return value.route == arrivalTimes.directions.N.arrivalTimes[0].routeId || arrivalTimes.directions.S.arrivalTimes[0].routeId;
			});

			["N", "S"].forEach((direction) => {
				// Remove invalid arrival times.
				arrivalTimes.directions[direction].arrivalTimes = arrivalTimes.directions[direction].arrivalTimes.filter((arrivalTime) => {
					return arrivalTime.arrivalTime && arrivalTime.arrivalTime > moment().unix();
				});

				// Sort arrival times by time.
				arrivalTimes.directions[direction].arrivalTimes.sort((a, b) => {
					if (a.arrivalTime < b.arrivalTime) {
						return -1;
					}
					if (a.arrivalTime > b.arrivalTime) {
						return 1;
					}
					return 0;
				});

				// Limit arrival times to 4 latest arrival times.
				arrivalTimes.directions[direction].arrivalTimes = arrivalTimes.directions[direction].arrivalTimes.slice(0, 4);

				// Add uptown / downtown name.
				arrivalTimes.directions[direction].name = (direction == "N" ? route[0].uptown : route[0].downtown);

				// Add first station to arrival times and remove unnecessary fields.
				arrivalTimes.directions[direction].arrivalTimes = arrivalTimes.directions[direction].arrivalTimes.map((arrivalTime) => {
					const arrivalTimeRoute = routes.filter(value => {
						return value.route == arrivalTime.routeId;
					});
					return {
						route: arrivalTimeRoute[0].route,
						firstLast: direction == "N" ? arrivalTimeRoute[0].first : arrivalTimeRoute[0].last,
						arrivalTime: arrivalTime.arrivalTime,
					};
				});
			});

			// Return station arrival times.
			res.send(arrivalTimes);
		} catch (err) {
			res.status(500).send(err.message);
		}
	});
};
