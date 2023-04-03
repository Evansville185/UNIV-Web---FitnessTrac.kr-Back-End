const express = require('express');
const routinesRouter = express.Router();

routinesRouter.use((req, res, next) => {
	console.log("A request s being made to /routines");
	next();
});

// GET /api/routines

// POST /api/routines (*)

// PATCH /api/routines/:routineId (**)

// DELETE /api/routines/:routineId (**)

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
