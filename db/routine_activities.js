const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, duration, count }) {
	try {
		const {
			rows: [routine_activity],
		} = await client.query(
			`
      INSERT INTO routine_activities ("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;
    `,
			[routineId, activityId, duration, count]
		);

		return routine_activity;
	} catch (error) {
		console.error("Error creating routine_activities:", error);
		throw error;
	}
}

async function getRoutineActivityById(id) {
	try {
		const {
			rows: [routine_activity],
		} = await client.query(
			`
      SELECT *
      FROM routine_activities
      WHERE id = $1;
      `,
			[id]
		);

		return routine_activity;
	} catch (error) {
		console.error("Error retrieving routine_activity by id:", error);
		throw error;
	}
}

async function getRoutineActivitiesByRoutine({ id }) {
	try {
		const { rows: routine_activity } = await client.query(
			`
        SELECT *
        FROM routine_activities
        WHERE "routineId" = $1;
      `,
			[id]
		);

		return routine_activity;
	} catch (error) {
		console.error("Error retrieving routine_activity by routine id,:", error);
		throw error;
	}
}

async function updateRoutineActivity({ id, ...fields }) {
	const setString = Object.keys(fields)
		.map((key, index) => `"${key}"=$${index + 1}`)
		.join(", ");

	// return early if called without fields
	if (setString.length === 0) {
		console.error("Failed to update, must edit routine_activity field(s)");
		return;
	}

	try {
		// updates necessary field(s)
		const {
			rows: [routine_activity],
		} = await client.query(
			`
        UPDATE routine_activities
        SET ${setString}
        WHERE id = ${id}
        RETURNING *;
        `,
			Object.values(fields)
		);

		// returns single object(updated routine_activity)
		return routine_activity;
	} catch (error) {
		console.error("Error updating routine_activity:", error);
		throw error;
	}
}

async function destroyRoutineActivity(id) {
	try {
		const {
			rows: [routine_activity],
		} = await client.query(
			`
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
      `,
			[id]
		);
		if (!routine_activity.id) {
			console.log(`${id} does not exist`);
			return null;
		}

		return routine_activity;
	} catch (error) {
		console.error("Error deleting routine_activity:", error);
		throw error;
	}
}

async function canEditRoutineActivity(routineActivityId, userId) {
	try {
		const {
			rows: [routine_activity],
		} = await client.query(
			`
		  SELECT *
		  FROM routine_activities
		  JOIN routines ON routines.id = routine_activities."routineId"
		  WHERE routine_activities.id = $1 AND routines."creatorId" = $2;
		`,
			[routineActivityId, userId]
		);

		return routine_activity;
	} catch (error) {
		console.error("Error checking if user can edit routine_activity activityId:", error);
		throw error;
	}
}

module.exports = {
	getRoutineActivityById,
	addActivityToRoutine,
	getRoutineActivitiesByRoutine,
	updateRoutineActivity,
	destroyRoutineActivity,
	canEditRoutineActivity,
};