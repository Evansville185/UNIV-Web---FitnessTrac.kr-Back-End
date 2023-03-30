const client = require("./client");
const bcrypt = require("bcrypt");

// database functions
const SALT_COUNT = 10;

// user functions
async function createUser({ username, password }) {
	const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
  let userToAdd = {username, hashedPassword}

	try {
		const {
			rows: [user],
		} = await client.query(
			`
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,
			[userToAdd.username, userToAdd.hashedPassword]
		);

		return user;
	} catch (error) {
		console.error("Error creating user:", error);
		throw error;
	}
}

async function getUser({ username, password }) {
	if (!username || !password) return;

	try {
		const user = await getUserByUsername(username);
		const hashedPassword = user.password;
		// passIsValid will be a boolean based on whether the password matches the hashed password
		const passwordsMatch = await bcrypt.compare(password, hashedPassword);
		if (passwordsMatch) {
			delete user.password;
			return user;
		} else {
			return null;
		}
	} catch (error) {
		console.error("Error finding user:", error);
		throw error;
	}
}

async function getUserById(userId) {
	try {
		const {
			rows: [user],
		} = await client.query(
			`
    SELECT id, username, password
    FROM users
    WHERE id=${userId}
    `
		);
		if (!user) {
			console.log(`${userId} does not exist`);
			return null;
		}
		delete user.password;

		return user;
	} catch (error) {
		console.error("Error finding activity by userId:", error);
		throw error;
	}
}

async function getUserByUsername(username) {
	try {
		const {
			rows: [user],
		} = client.query(
			`
    SELECT *
    FROM users
    WHERE username=$1
    `,
			[username]
		);

		return user;
	} catch (error) {
		console.error("Error finding user by username:", error);
		throw error;
	}
}

module.exports = {
	createUser,
	getUser,
	getUserById,
	getUserByUsername,
};
