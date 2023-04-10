/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { requiredUser } = require("./utils");
const {
	createUser,
	getAllRoutinesByUser,
	getUserById,
	getUserByUsername,
	getPublicRoutinesByUser,
} = require("../db");

// usersRouter.use((req, res, next) => {
// 	console.log("A request s being made to /users");
// 	next();
// });

// POST /api/users/register
// Create a new user. Require username and password, and hash password before saving user to DB. Require all passwords to be at least 8 characters long.
// Throw errors for duplicate username, or password-too-short.
usersRouter.post("/register", async (req, res, next) => {
	const { username, password } = req.body;

	//*Check username if already exist
	const checkUsername = await getUserByUsername(username);
	if (checkUsername) {
		res.send({
			error: "UsernameExistsError",
			message: `User ${username} is already taken.`,
			name: "UsernameExistsError",
		});
	} else if (!username) {
		res.send({
			error: "UsernameNullError",
			message: "Name not filled out",
			name: "UsernameNullError",
		});
	} else if (password.length < 8) {
		res.send({
			error: "PasswordLengthError",
			message: "Password Too Short!",
			name: "PasswordLengthError",
		});
	} else {
		try {
			const user = await createUser({ username, password });
			const token = jwt.sign(
				{
					id: user.id,
					username,
				},
				JWT_SECRET,
				{
					expiresIn: "1w",
				}
			);

			res.send({
				user: {
					id: user.id,
					username: username,
				},
				token: token,
				message: "Thank you for signing up!",
			});
		} catch (error) {
			next(error);
		}
	}
});

// POST /api/users/login
//*Log in the user. Require username and password, and verify that plaintext login password matches the saved hashed password before returning a JSON Web Token.
//*Keep the id and username in the token.
usersRouter.post("/login", async (req, res, next) => {
	const { username, password } = req.body;

	try {
		if (!username || !password) {
			// const error = new Error("Please input a username and password");
			// error.status = 400;
			// throw error;
			res.status(400).send({
				error: "UnauthorizedError",
				message: "Please input a username and password",
				name: "UnauthorizedError",
			});
		}

		const user = await getUserByUsername(username);

		if (!user) {
			// const error = new Error("User not found");
			// error.status = 401;
			// throw error;
			res.status(400).send({
				error: "UnauthorizedError",
				message: "Please input a username",
				name: "UnauthorizedError",
			});
		}

		const hashedPassword = user.password;
		const passwordsMatch = await bcrypt.compare(password, hashedPassword);

		if (!passwordsMatch) {
			// const error = new Error("Incorrect password");
			// error.status = 401;
			// throw error;
			res.status(401).send({
				error: "UnauthorizedError",
				message: "Please input a password",
				name: "UnauthorizedError",
			});
		}

		const token = jwt.sign(
			{
				id: user.id,
				username,
			},
			JWT_SECRET
		);

		res.send({
			user: {
				id: user.id,
				username: username,
			},
			token: token,
			message: "you're logged in!",
		});
	} catch (error) {
		next(error);
	}
});

// GET /api/users/me (*)
//*Send back the logged-in user's data if a valid token is supplied in the header.
usersRouter.get("/me", requiredUser, async (req, res, next) => {
	//*middleware func 'requiredUser' adds property 'user' to the 'req' obj with the decoded data from JWT token
	const { id: userId } = req.user;

	try {
		//*'getuserbyid' func retrieves the user's info from the db using 'userId' value obtain from 'req' obj and sends the user's info back to client in response body
		const user = await getUserById(userId);
		if (!user) {
			res.send({
				name: "UserNotFoundError",
				message: "User not found",
			});
		}
		res.send({
			id: user.id,
			username: user.username,
		});
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// GET /api/users/:username/routines (*)
//*Get a list of public routines for a particular user.
usersRouter.get("/:username/routines", requiredUser, async (req, res, next) => {
	const { username } = req.params;
	let routines;

	try {
		const publicRoutines = await getPublicRoutinesByUser({ username });

		if (req.user.username !== username) {
			routines = publicRoutines;
		} else {
			const userRoutines = await getAllRoutinesByUser({ username });
			routines = userRoutines;
		}

		res.send(routines);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = usersRouter;
