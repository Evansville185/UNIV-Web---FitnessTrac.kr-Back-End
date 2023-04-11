const http = require("http");
const chalk = require("chalk");
const app = require("./app");

const PORT = process.env["PORT"] ?? 3000;
const server = http.createServer(app);

// app.listen(3000, function () {
// 	console.log(chalk.blackBright("CORS-enabled web server listening on port 3000"));
// });

server.listen(PORT, () => {
	console.log(
		chalk.whiteBright("Server is listening on PORT:"),
		chalk.yellow(PORT),
		chalk.blackBright("Go spread some objects!")
		// chalk.blueBright("Get your routine on!")
	);
});
