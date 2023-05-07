module.exports = app => {
    const role = require("../controller/role.controller");
  
    var router = require("express").Router();
  
    router.post("/", role.create);
  
    router.get("/", role.findAll);

    router.get("/:id", role.findOne);
  
    router.put("/:id", role.update);

    router.put("/remove/update_access_module/:id", role.removeValueFromAccessModule);

    router.put("/add/update_access_module/:id", role.addValueFromAccessModule);
  
    router.delete("/:id", role.delete);
  
    router.delete("/", role.deleteAll);
  
    app.use("/api/role", router);
  };
  