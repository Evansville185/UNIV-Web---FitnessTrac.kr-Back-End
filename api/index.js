const express = require("express");
const router = express.Router();

//jwt request setup------------------------------------------------------------
// set `req.user` if necessary
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { getUserById } = require("../db");

// router.use(async (req, res, next) => {
// 	const prefix = "Bearer ";
// 	const auth = req.header("Authorization");

// 	if (!auth) {
// 		// nothing to see here
// 		next();
// 	} else if (auth.startsWith(prefix)) {
// 		const token = auth.slice(prefix.length);

// 		try {
// 			const { id } = jwt.verify(token, JWT_SECRET);

// 			if (id) {
// 				req.user = await getUserById(id);
// 				next();
// 			}
// 		} catch ({ name, message }) {
// 			next({ name, message });
// 		}
// 	} else {
// 		next({
// 			name: "AuthorizationHeaderError",
// 			message: `Authorization token must start with ${prefix}`,
// 		});
// 	}
// });

// router.use((req, res, next) => {
// 	if (req.user) {
// 		console.log("User is set:", req.user);
// 	}

// 	next();
// });

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
			{ title: "Users", url: "http://localhost:3000/api/users" },
			{ title: "Activities", url: "http://localhost:3000/api/activities" },
			{ title: "Routines", url: "http://localhost:3000/api/routines" },
			{ title: "Routine Activities", url: "http://localhost:3000/api/routine_activities" },
		],
	});
});

module.exports = router;
