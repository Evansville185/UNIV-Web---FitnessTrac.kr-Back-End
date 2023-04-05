const express = require("express");
const routineActivitiesRouter = express.Router();
const { requiredUser } = require("./utils");
const {
	getRoutineActivityById,
	getRoutineById,
	destroyRoutineActivity,
	updateRoutineActivity,
} = require("../db");

// routineActivitiesRouter.use((req, res, next) => {
// 	console.log("A request s being made to /routineActivites");
// 	next();
// });

// PATCH /api/routine_activities/:routineActivityId (**)
routineActivitiesRouter.patch("/:routineActivityId", requiredUser, async (req, res, next) => {
	const { routineActivityId } = req.params;
	const { duration, count } = req.body;
	const { id: userId, username } = req.user;

	try {
		//*Find Id in routine_activity
		const routineActivity = await getRoutineActivityById(routineActivityId);
		//*Use 'routineActivity' table to reference 'routineId' to use for 'getRoutineId()' param
		const routine = await getRoutineById(routineActivity.routineId);

		if (!routineActivity) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: "Routine Activity does not exist",
				name: "RoutineDoesNotExist",
			});
			//*Compare 'creatorId' and logged in user do not match then throw error
		} else if (routine.creatorId !== userId) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: `User ${username} is not allowed to update ${routine.name}`,
				name: "NotRoutineCreator",
			});
			//*Check if fields were updated, else throw error
		} else if (Object.keys(req.body).length === 0) {
			res.send({
				error: "NoUpdatesError",
				message: "Need to update field(s) to process change",
				name: "MissingUpdates",
			});
		}
		//*Update fields
		const update = await updateRoutineActivity({ id: routineActivityId, duration, count });

		res.send(update);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// DELETE /api/routine_activities/:routineActivityId (**)
routineActivitiesRouter.delete("/:routineActivityId", requiredUser, async (req, res, next) => {
	const { routineActivityId } = req.params;
	const { id: userId, username } = req.user;

	try {
		//*Find Id in routine_activity
		const routineActivity = await getRoutineActivityById(routineActivityId);
		//*Use 'routineActivity' table to reference 'routineId' to use for 'getRoutineId()' param
		const routine = await getRoutineById(routineActivity.routineId);

		if (!routineActivity) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: "Routine Activity does not exist",
				name: "RoutineDoesNotExist",
			});
			//*Compare 'creatorId' and logged in user do not match then throw error
		} else if (routine.creatorId !== userId) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: `User ${username} is not allowed to delete ${routine.name}`,
				name: "NotRoutineCreator",
			});
		} else {
			//*Delete routine activity id
			const destroy = await destroyRoutineActivity(routineActivityId);

			res.send(destroy);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = routineActivitiesRouter;
