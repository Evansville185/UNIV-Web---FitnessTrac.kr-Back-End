const express = require("express");
const routinesRouter = express.Router();
const { requiredUser } = require("./utils");
const {
	addActivityToRoutine,
	createRoutine,
	destroyRoutine,
	getAllRoutines,
	getRoutineActivitiesByRoutine,
	getRoutineById,
	updateRoutine,
} = require("../db");

// routinesRouter.use((req, res, next) => {
// 	console.log("A request s being made to /routines");
// 	next();
// });

// GET /api/routines
routinesRouter.get("/", async (req, res, next) => {
	try {
		const routines = await getAllRoutines();

		res.send(routines);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// POST /api/routines (*)
routinesRouter.post("/", requiredUser, async (req, res, next) => {
	const { isPublic, name, goal } = req.body;
	//*Extract id from 'requireUser' middleware
	const { id: userId } = req.user;

	try {
		//*Set 'creatorId' as id from middleware, to be the same id of user logged in
		const newRoutine = await createRoutine({ creatorId: userId, isPublic, name, goal });

		res.send(newRoutine);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// PATCH /api/routines/:routineId (** logged in user & owner of object)
routinesRouter.patch("/:routineId", requiredUser, async (req, res, next) => {
	const { routineId } = req.params;
	const { isPublic, name, goal } = req.body;
	//*Object destructuring from 'requiredUser' middleware and to assign value of 'id' property of the 'req.user' object to new variable 'userId' equivalent to 'const userId = req.user.id'. Technically don't need to re-assign id name but just good to know.
	//*same for username, as is... without assigning variable name
	const { id: userId, username } = req.user;

	try {
		const checkRoutineId = await getRoutineById(routineId);
		if (checkRoutineId.creatorId !== userId) {
			res.status(403).send({
				error: "UnauthorizedUpdateError",
				message: `User ${username} is not allowed to update ${checkRoutineId.name}`,
				name: "NotRoutineCreator",
			});
			//*FYI Object.entries returns an array of key-value pairs, array would be truthy even if req.body is an empty obj.
			//*checking the length of the resulting array will give correct truthy/falsy value.
		} else if (Object.keys(req.body).length === 0) {
			res.send({
				error: "NoUpdatesError",
				message: "Need to update field(s) to process change",
				name: "MissingUpdates",
			});
		}
		const update = await updateRoutine({
			id: routineId,
			isPublic,
			name,
			goal,
		});

		res.send(update);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// DELETE /api/routines/:routineId (** logged in user & owner of object)
routinesRouter.delete("/:routineId", requiredUser, async (req, res, next) => {
	const { routineId } = req.params;
	const { id: userId, username } = req.user;

	try {
		const deleteRoutineId = await getRoutineById(routineId);
		//*Check if routineId exists in DB and if logged in user matches 'creatorId', proceed
		if (!deleteRoutineId) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: "Routine does not exist",
				name: "RoutineDoesNotExist",
			});
		} else if (deleteRoutineId.creatorId !== userId) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: `User ${username} is not allowed to delete ${deleteRoutineId.name}`,
				name: "NotRoutineCreator",
			});
		} else {
			const destroy = await destroyRoutine(routineId);
			res.send(destroy);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// POST /api/routines/:routineId/activities
routinesRouter.post("/:routineId/activities", async (req, res, next) => {
	const { routineId } = req.params;
	const { activityId, duration, count } = req.body;

	try {
		const checkRoutineId = await getRoutineById(routineId);
		//*Passing argument of object literal with property 'id' whose value is 'routineId'
		const checkActivities = await getRoutineActivitiesByRoutine({ id: routineId });
		//*CheckActivities is an array of objects, each representing a routine_activity record
		//*The activityId property is not available on the array itself, but on each of its elements
		//*Using find() method to check whether any elements in array have the same activityId trying to add to the routine
		const existingActivity = checkActivities.find((activity) => activity.activityId === activityId);
		console.log("LOOK HERE FIRST", routineId);
		console.log("LOOK HERE SECOND", checkRoutineId);
		console.log("LOOK HERE THIRD", checkActivities);
		if (!checkRoutineId) {
			res.status(404).send({
				error: "UnauthorizedAddError",
				message: "Routine does not exist",
				name: "RoutineDoesNotExist",
			});
		}
		//*Checking valued pair within routine_activity exists
		else if (checkRoutineId && existingActivity) {
			res.send({
				error: "DuplicateError",
				message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
				name: "CannotAddDuplicateActivity",
			});
		}
		const newRoutineActivity = await addActivityToRoutine({
			routineId,
			activityId,
			duration,
			count,
		});

		res.send(newRoutineActivity);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = routinesRouter;
