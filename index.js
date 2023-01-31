const express = require("express");
const connectDatabase = require("./connectDatabase");
const PORT = 3000;
const app = express();
const user = require("./routes/userRoutes");
const errorMiddleware = require("./middleware/error");
const bodyParser = require('body-parser')
app.use(express.json())
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
connectDatabase();


app.use("/api", user);
app.use(errorMiddleware)
app.listen(PORT, () => {
  console.log("server is listen on 3000");
});
