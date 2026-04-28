const http = require("http");
const { app } = require("./app");
const { connectDb } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDb();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

