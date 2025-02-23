const app = require("./index");
const connectDb = require("./db/connectDb");
const scheduleMessage =
  require("./services/scheduler").default || require("./services/scheduler");

const port = 4832;

const startServer = async () => {
  try {
    await connectDb();
    scheduleMessage();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
