/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
	createUser,
	getUserByUsername,
	getUserById,
	getPublicRoutinesByUser,
	getAllRoutinesByUser,
} = require("../db");

usersRouter.use((req, res, next) => {
	console.log("A request s being made to /users");
	next();
});


// POST /api/users/register
// Create a new user. Require username and password, and hash password before saving user to DB. Require all passwords to be at least 8 characters long.
// Throw errors for duplicate username, or password-too-short.
usersRouter.post("/register", async (req, res, next) => {
	const { username, password } = req.body;

	const _user = await getUserByUsername(username);
	if (_user) {
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
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
});

// POST /api/users/login
//*Log in the user. Require username and password, and verify that plaintext login password matches the saved hashed password before returning a JSON Web Token.
//*Keep the id and username in the token.
usersRouter.post("/login", async (req, res, next) => {
	const { username, password } = req.body;

	//*request must ave both
	if (!username || !password) {
		res.send({
			name: "MissingCredentialsError",
			message: "Please input both a username and password",
		});
	}

	try {
		const user = await getUserByUsername(username);
		const hashedPassword = user.password;
		const passwordsMatch = await bcrypt.compare(password, hashedPassword);

		if (user && passwordsMatch) {
			//*if condition true, create token for user
			const token = jwt.sign(
				{
					id: user.id,
					username,
				},
				JWT_SECRET
			);
			token;

			const decode = jwt.verify(token, JWT_SECRET);
			decode;

			res.send({
				user: {
					id: user.id,
					username: username,
				},
				token: token,
				message: "you're logged in!",
			});
		} else {
			next({
				name: "IncorrectCredentialsError",
				message: "Username or password is incorrect",
			});
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// GET /api/users/me (*)
//*Send back the logged-in user's data if a valid token is supplied in the header.
const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.status(401).send({
			error: "UnauthorizationError",
			name: "401 - Unauthorized",
			message: "You must be logged in to perform this action",
		});
	} else {
		const token = authHeader.split(" ")[1];
		try {
			const decode = jwt.verify(token, JWT_SECRET);
			req.user = decode;
			next();
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
};

usersRouter.get("/me", authenticate, async (req, res, next) => {
	//*middleware func 'authenticate' adds property 'user' to the 'req' obj with the decoded data from JWT token
	const userId = req.user.id;
	try {
		//*'getuserbyid'  func retrieves the user's info from the db using 'userId' value obtain from 'req' obj and sends the user's info back to client in response body
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
usersRouter.get("/:username/routines", async (req, res, next) => {
	const { username } = req.params;
	let routines;

	try {
		const publicRoutines = await getPublicRoutinesByUser({ username });

		const authHeader = req.headers.authorization;
		if (!authHeader) {
			routines = publicRoutines;
		} else {
			const token = authHeader.split(" ")[1];
			const decoded = jwt.verify(token, JWT_SECRET);
			const userId = decoded.id;
			const user = await getUserById(userId);

			if (user.username !== username) {
				routines = publicRoutines;
			} else {
				const userRoutines = await getAllRoutinesByUser({ username });
				routines = publicRoutines && userRoutines;
			}
		}

		res.send(routines);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = usersRouter;
