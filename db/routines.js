const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows:[routine], } = await client.query(
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
    const { rows: [routine], } = await client.query(
      `
      SELECT id, "creatorId", "isPublic", name, goal
      FROM routines
      WHERE id=$1;
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
    const result = await client.query(`
      SELECT id, name, goal
      FROM routines
      LEFT JOIN routine_activities ra ON r.id = ra."routineId"
      WHERE ra."activityId" IS NULL
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function getAllRoutines() {}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

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
