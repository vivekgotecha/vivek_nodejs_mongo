const dotenv = require("dotenv")
dotenv.config();
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(express.json());

const db = require("./app/config/config");
app.use(bodyParser.json());

let mongoose = require("mongoose")

 mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

require("./app/route/user.route")(app);
require("./app/route/role.route")(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
