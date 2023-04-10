const express = require("express");
const router = express.Router();

//jwt request setup------------------------------------------------------------
// set `req.user` if necessary

// GET /api/health
router.get("/health", async (req, res, next) => {
	res.send({
		name: "ServerInGoodHealth",
		message: "Server in good health",
	});

	next();
});

// ROUTER: /api/users
const usersRouter = require("./users");
router.use("/users", usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require("./activities");
router.use("/activities", activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require("./routines");
router.use("/routines", routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require("./routineActivities");
router.use("/routine_activities", routineActivitiesRouter);

//*API ERROR handler
router.use((req, res) => {
	res.status(404).send({
		name: "404 - PageNotFound",
		message: "Invalid endpoint, navigate to a valid endpoint below...",
		endpoints: [
			{ title: "Users", url: "https://fitnesstrackr-be.onrender.com/api/users" },
			{ title: "Activities", url: "https://fitnesstrackr-be.onrender.com/api/activities" },
			{ title: "Routines", url: "https://fitnesstrackr-be.onrender.com/api/routines" },
			{
				title: "Routine Activities",
				url: "https://fitnesstrackr-be.onrender.com/api/routine_activities",
			},
		],
	});
});

module.exports = router;
