const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();

const CompanyRouter = require("./Routers/CompanyRouter");
const EmployeeRouter = require("./Routers/EmployeeRouter");

const dotenv = require("dotenv");
dotenv.config(); // No need to pass the file path for dotenv.config()

// Requiring Cookie-Parser
const cookieParser = require("cookie-parser");

// Middleware

app.use(express.json());
app.use(cookieParser());
app.use(morgan("common"));
app.use("/company", CompanyRouter);
app.use("/employee", EmployeeRouter);

main()
  .then(() => {
    console.log("Connection Successfully!");

    // Create HTTP server
    const server = http.createServer(app);

    // SERVER
    const PORT = process.env.PORT || 4000; // Use environment variable or default port 4000
    server.listen(PORT, () => {
      console.log(`Listening to Port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Invex");
}
app.get("/", (req, res) => {
  res.send("OK FROM SERVER!");
});
