/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { createUser, getUserByUsername, getUserById } = require("../db");
// const { requiredUser } = require('./utils')
const app = express();

usersRouter.use((req, res, next) => {
	console.log("A request s being made to /users");

	next();
});

// const authenticate = (req, res, next) => {
// 	const authHeader = req.header['authorization'];
// 	if(!authHeader) {
// 		res.send({
// 			error: "UnauthorizationError",
// 			name: "UnauthorizationError",
// 			message: "Token invalid",
// 		});

// 		const token = authHeader.split(' ')[1];
// 		try {
// 			const decode = jwt.verify(token, JWT_SECRET);
// 			req.user = decode;
			
// 			next();
// 		} catch ({ name, message }) {
// 			next({name, message});
// 		}
// 	}
// }


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

			const verifyToken = jwt.verify(token, JWT_SECRET);
			verifyToken;

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
usersRouter.get('/me', async (req, res, next) => {
	const authHeader = req.headers['Authorization'];
	if(!authHeader) {
		next({ 
			name: "UnauthorizationError",
			message: "Authorization header missing"
		});
	}
	const token = authHeader.split(' ')[1];
	try {
		const decode = jwt.verify(token, JWT_SECRET);
		const userId = decode.id;
		const user = await getUserById(userId);
		if(!user) {
			next({ 
				name: "UserNotFound",
				message: "User not found"
			});
		}
		res.send(user);
	} catch ({ name, messsage }) {
		res.send({ name: "InvalidToken", 
		message: "Invalid token",
	});
	}
});

// GET /api/users/:username/routines (*)
//*Get a list of public routines for a particular user.

module.exports = usersRouter;


// usersRouter.get("/me", async (req, res, next) => {
// 	const authHeader = req.headers['Authorization']

// 	if (!authHeader) {
// 		return res.send({
// 			name: "UnathorizationError",
// 			message: "Token not valid",
// 		});
// 	}
// 	//*Extract the token from the authorization header
// 	const token = authHeader.split(" ")[1];

// 		try {
// 			//*Verify the token using the JWT_SECRET
// 			const decodeToken = jwt.verify(token, JWT_SECRET);

// 			//*Get the user id from the decoded token
// 			const userId = decodeToken.id;

// 			//*Get the user data by id from the database
// 			const user = await getUserById(userId);

// 			//*If user is not found, send back error response
// 			if (!user) {
// 				return res.send({
// 					error: "UserNotFoundError",
// 					message: "User not found",
// 				});
// 			} else {

// 			//*Send the user data as the response body
// 			res.send({
// 				id: user.id,
// 				username: user.username,
// 			});
// 		}
// 		} catch ({ name, message }) {
// 			next({ name, message });
// 		}
// });

// usersRouter.use((req, res, next) => {
// 	if (req.user) {
// 		console.log("User is set:", req.user);
// 	}

// 	next();
// });
//-----------------------
// usersRouter.get('/me', authenticate, async (req, res, next) => {
// 	const userId = req.user.id;
// 	try {
// 		const user = await getUserById(userId);
// 		if(!user) {
// 			res.send({
// 				name: "UserNotFoundError",
// 				message: "User not found"
// 			});
// 		}

// 		res.send(user);
// 	} catch ({ name, message }){
// 		next({ name, message });
// 	}
// });