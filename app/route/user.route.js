module.exports = (app) => {
  const users = require("../controller/user.controller");

  var router = require("express").Router();

  router.post("/signup", users.signup);

  router.post("/login", users.login);

  router.get("/", users.findAll);

  router.get("/:id", users.findOne);

  router.put("/:id", users.update);

  router.put("/", users.updateMany);

  router.post("/updateMany", users.updateManyUsers);

  router.get("/check_access_module/:id", users.checkAccessModule);

  router.delete("/:id", users.delete);

  router.delete("/", users.deleteAll);

  app.use("/api/users", router);
};
