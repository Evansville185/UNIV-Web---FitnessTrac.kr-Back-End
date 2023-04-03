const express = require("express");
const activitiesRouter = express.Router();
const { getAllActivities } = require("../db");

activitiesRouter.use((req, res, next) => {
	console.log("A request s being made to /activities");
	next();
});

// GET /api/activities/:activityId/routines

// GET /api/activities

// POST /api/activities (*)

// PATCH /api/activities/:activityId (*)

module.exports = activitiesRouter;
