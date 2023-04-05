const express = require('express');
const routineActivitiesRouter = express.Router();
const { requiredUser } = require('./utils');
const {
	getRoutineActivityById,
	getRoutineById,
	destroyRoutineActivity,
} = require("../db");


// routineActivitiesRouter.use((req, res, next) => {
// 	console.log("A request s being made to /routineActivites");
// 	next();
// });

// PATCH /api/routine_activities/:routineActivityId (**)


// DELETE /api/routine_activities/:routineActivityId (**)
routineActivitiesRouter.delete("/:routineActivityId", requiredUser, async (req, res, next) => {
	const { routineActivityId } = req.params;
	const { id: userId, username } = req.user;

	try {
		const routineActivity = await getRoutineActivityById(routineActivityId);
		const routine = await getRoutineById(routineActivity.routineId);

		if(!routineActivity) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: "Routine Activity does not exist",
				name: "RoutineDoesNotExist",
			});
		} else if(routine.creatorId !== userId) {
			res.status(403).send({
				error: "UnauthorizedDeleteError",
				message: `User ${username} is not allowed to delete ${routine.name}`,
				name: "NotRoutineCreator",
			});
		} else {
			const destroy= await destroyRoutineActivity(routineActivityId);
		
			res.send(destroy);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = routineActivitiesRouter;

//const existingActivity = checkActivities.find((activity) => activity.activityId === activityId);