const express = require("express");
const connectDatabase = require("./connectDatabase");
const PORT = 3000;
const app = express();
const user = require("./routes/userRoutes");
const post = require("./routes/postRoutes")
const errorMiddleware = require("./middleware/error");
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
app.use(express.json())
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload({
  useTempFiles:true
}))
connectDatabase();


app.use("/api", user);
app.use("/api",post)

app.use(errorMiddleware)
app.listen(PORT, () => {
  console.log("server is listen on 3000");
});
