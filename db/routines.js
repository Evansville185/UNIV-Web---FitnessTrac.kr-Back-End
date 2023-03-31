const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
	try {
		const {
			rows: [routine],
		} = await client.query(
			`
      INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `,
			[creatorId, isPublic, name, goal]
		);

		return routine;
	} catch (error) {
		console.error("Error creating routine:", error);
		throw error;
	}
}

async function getRoutineById(routineId) {
	try {
		const {
			rows: [routine],
		} = await client.query(
			`
      SELECT *
      FROM routines
      WHERE id = $1;
    `,
			[routineId]
		);
		if (!routine) {
			console.log(`${routineId} does not exist`);
			return null;
		}

		return routine;
	} catch (error) {
		console.error("Error finding routine by routineId:", error);
		throw error;
	}
}

async function getRoutinesWithoutActivities() {
	try {
		const { rows: routines } = await client.query(
			`
      SELECT *
      FROM routines
      LEFT JOIN routine_activities ON routines.id = routine_activities."routineId"
      WHERE routine_activities."activityId" IS NULL;
    `
		);
		return routines;
	} catch (error) {
		console.error("Error retrieving routines without activities:", error);
		throw error;
	}
}

async function getAllRoutines() {
	try {
		const { rows: routines } = await client.query(
			`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      `
		);

		return attachActivitiesToRoutines(routines);
	} catch (error) {
		console.error("Error retrieving routines:", error);
		throw error;
	}
}

async function getAllPublicRoutines() {
	try {
		const { rows: routines } = await client.query(
			`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "isPublic" = true;
      `
		);

		return attachActivitiesToRoutines(routines);
	} catch (error) {
		console.error("Error retrieving public routines:", error);
		throw error;
	}
}

async function getAllRoutinesByUser({ username }) {
	try {
		const { rows: routines } = await client.query(
			`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE username = $1
      `,
			[username]
		);

		return attachActivitiesToRoutines(routines);
	} catch (error) {
		console.error("Error retrieving routines by username:", error);
		throw error;
	}
}

async function getPublicRoutinesByUser({ username }) {
	try {
		const { rows: routines } = await client.query(
			`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users on routines."creatorId" = users.id
      WHERE username = $1 AND "isPublic" = true;
      `,
			[username]
		);

		return attachActivitiesToRoutines(routines);
	} catch (error) {
		console.error("Error retrieving public routines by username:", error);
		throw error;
	}
}

async function getPublicRoutinesByActivity({ id }) {
	try {
		const { rows: routines } = await client.query(
			`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      JOIN routine_activities ON routine_activities."routineId" = routines.id
      WHERE routines."isPublic" = true AND routine_activities."activityId" = $1;
      `,
			[id]
		);

		return attachActivitiesToRoutines(routines);
	} catch (error) {
		console.error("Error retrieving public routines by activity:", error);
		throw error;
	}
}

async function updateRoutine({ id, ...fields }) {
	// build the set string
	const setString = Object.keys(fields)
		.map((key, index) => `"${key}"=$${index + 1}`)
		.join(", ");

	// return early if called without fields
	if (setString.length === 0) {
		console.error("Failed to udpate, must edit routine field(s)");
		return;
	}

	try {
		// updates necessary field(s)
		const {
			rows: [routine],
		} = await client.query(
			`
        UPDATE routines
        SET ${setString}
        WHERE id = ${id}
        RETURNING *;
        `,
			Object.values(fields)
		);

		// returns single object(updated routine)
		return routine;
	} catch (error) {
		console.error("Error updating routine:", error);
		throw error;
	}
}

async function destroyRoutine(id) {
	try {
		await client.query(
			`
      DELETE FROM routine_activities
      WHERE "routineId" = $1
      RETURNING *;
      `,
			[id]
		);
		const {
			rows: [routine],
		} = await client.query(
			`
        DELETE FROM routines
        WHERE id = $1
        RETURNING *;
        `,
			[id]
		);

		return routine;
	} catch (error) {
		console.error("Error deleting routine:", error);
		throw error;
	}
}

module.exports = {
	getRoutineById,
	getRoutinesWithoutActivities,
	getAllRoutines,
	getAllPublicRoutines,
	getAllRoutinesByUser,
	getPublicRoutinesByUser,
	getPublicRoutinesByActivity,
	createRoutine,
	updateRoutine,
	destroyRoutine,
};
