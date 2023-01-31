const mongoose = require("mongoose");
const connectDatabase = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017", {
      useNewUrlParser: true,
    })
    .then((data) => {
      console.log(`mongodb connected with server : ${data.connection.host}`);
    });
};
module.exports = connectDatabase;

