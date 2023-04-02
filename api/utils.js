//helper function stating user is not logged in
function requireUser(req, res, next) {
    if(!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform tihs action",
        });
    }

    next();
}

module.exports = { requireUser };