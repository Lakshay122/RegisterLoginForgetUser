const mongoose = require("mongoose");
const connectDatabase = () => {
  mongoose
    .connect("mongodb+srv://demo:BANIYAboy123@cluster0.c4i8nmk.mongodb.net/test1?retryWrites=true&w=majority", {
      useNewUrlParser: true,
    })
    .then((data) => {
      console.log(`mongodb connected with server : ${data.connection.host}`);
    });
};
module.exports = connectDatabase;

