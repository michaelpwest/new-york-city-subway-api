module.exports = (app, params) => {
	const moment = require("moment");

	const mta = params.mta;

	// Service status.
	app.get("/service-status/:line?", async(req, res) => {
		try {
			const lineParam = req.params.line;

			const serviceStatus = await mta.status("subway");
			if (!serviceStatus) {
				throw new Error("Cannot retrieve service status.");
			}

			// Remove unnecessary fields.
			serviceStatus.forEach((lineStatus) => {
				delete lineStatus.Date;
				delete lineStatus.Time;
			});

			let serviceStatusResponse = {
				timestamp: moment().unix(),
				serviceStatus: {},
			};

			if (lineParam) {
				// Return service status detail for line.
				const serviceStatusLine = serviceStatus.find(value => {
					return value.name == lineParam;
				});
				if (!serviceStatusLine) {
					throw new Error("Invalid line specified.");
				}

				serviceStatusResponse.serviceStatus = serviceStatusLine;
			} else {
				// Return service status for all lines.
				serviceStatus.forEach((lineStatus) => {
					delete lineStatus.text;
				});

				serviceStatusResponse.serviceStatus = serviceStatus;
			}

			res.send(serviceStatusResponse);
		} catch (err) {
			res.status(500).send(err);
		}
	});
};
