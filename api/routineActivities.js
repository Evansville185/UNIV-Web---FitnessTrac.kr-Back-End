const express = require('express');
const routineActivitiesRouter = express.Router();

routineActivitiesRouter.use((req, res, next) => {
	console.log("A request s being made to /routineActivites");
	next();
});

// PATCH /api/routine_activities/:routineActivityId (**)

// DELETE /api/routine_activities/:routineActivityId (**)

module.exports = routineActivitiesRouter;
