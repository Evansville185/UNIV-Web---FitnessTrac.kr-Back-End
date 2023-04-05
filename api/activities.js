const express = require("express");
const activitiesRouter = express.Router();
const { requiredUser } = require("./utils");
const {
	createActivity,
	getActivityById,
	getActivityByName,
	getAllActivities,
	getPublicRoutinesByActivity,
	updateActivity,
} = require("../db");

// activitiesRouter.use((req, res, next) => {
// 	console.log("A request s being made to /activities");
// 	next();
// });

// GET /api/activities/:activityId/routines
activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
	const { activityId } = req.params;

	try {
		//*Checking if activity exists
		const activity = await getActivityById(activityId);
		if (!activity) {
			res.send({
				error: "ActivityNotFoundError",
				message: `Activity ${activityId} not found`,
				name: "ActivityDoesNotExist",
			});
		}
		//*GET all public routines that include the activityId using declared activity
		const publicRoutines = await getPublicRoutinesByActivity(activity);
		res.send(publicRoutines);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

/*create a GET route for /api/activities/:activityId/routines, which takes the activityId parameter from the URL.
Inside the route handler, first check if the activity exists by calling getActivityById with the activityId. If it doesn't exist, return a 404 error
If activity exists, call getPublicRoutinesByActivity with the activity object to retrieve all public routines that include the activity, then send the results as a JSON response
Handle any errors that might occur and pass them to the Express error handling middleware with next(error) */

// GET /api/activities
activitiesRouter.get("/", async (req, res, next) => {
	try {
		const activities = await getAllActivities();

		res.send(activities);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// POST /api/activities (*)
activitiesRouter.post("/", requiredUser, async (req, res, next) => {
	const { name, description } = req.body;

	try {
		//*Checking if activity exists
		const activity = await getActivityByName(name);
		if (activity) {
			res.send({
				error: "DuplicateActivityNameError",
				message: `An activity with name ${name} already exists`,
				name: "DuplicateActivityName",
			});
		} else {
			//*Creates new activity
			const newActivity = await createActivity({ name, description });

			res.send(newActivity);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// PATCH /api/activities/:activityId (*)
activitiesRouter.patch("/:activityId", requiredUser, async (req, res, next) => {
	const { activityId } = req.params;
	const { name, description } = req.body;

	try {
		const checkActivityId = await getActivityById(activityId);
		//*Checking if activity exists
		if (!checkActivityId) {
			res.send({
				error: "ActivityIdNotFoundError",
				message: `Activity ${activityId} not found`,
				name: "ActivityIdDoesNotExist",
			});
		}

		const activityName = await getActivityByName(name);
		//*Checking if activity name already exists and also needs to check if id's match
		if (activityName && activityName.id !== activityId) {
			res.send({
				error: "DuplicateActivityNameError",
				message: `An activity with name ${activityName.name} already exists`,
				name: "DuplicateActivityName",
			});
		} else {
			//*Updating activity
			const update = await updateActivity({ id: activityId, name: name, description: description });

			res.send(update);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = activitiesRouter;
