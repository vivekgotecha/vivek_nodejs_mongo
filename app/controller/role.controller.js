const Role = require("../model/role.module");
const jwt = require("jsonwebtoken");

exports.create = (req, res) => {
  // Validate request
  if (!req.body.roleName) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Role
  const role = new Role({
    roleName: req.body.roleName,
    accessModule: req.body.accessModule,
    active: req.body.active ? req.body.active : false,
  });

  // Save Role in the database
  role
    .save(role)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the Role.",
      });
    });
};

exports.findAll = (req, res) => {
  const roleName = req.query.roleName;
  var condition = roleName
    ? { roleName: { $regex: new RegExp(roleName), $options: "i" } }
    : {};

  Role.find(condition)
    .then((data) => {
      res.send({ list: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving roles.",
      });
    });
};

// Find a single Role with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Role.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Role with id " + id });
      else res.send({ role: data });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Role with id=" + id });
    });
};

// Update a Role by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  Role.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Role with id=${id}. Maybe Role was not found!`,
        });
      } else res.send({ message: "Role was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: err + "Error updating Role with id=" + id,
      });
    });
};

// Delete a Role with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Role.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Role with id=${id}. Maybe Role was not found!`,
        });
      } else {
        res.send({
          message: "Role was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Role with id=" + id,
      });
    });
};

// Delete all Roles from the database.
exports.deleteAll = (req, res) => {
  Role.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Roles were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all ps.",
      });
    });
};

exports.removeValueFromAccessModule = (req, res) => {
  const id = req.params.id;
  const remove_accessModule = req.body.accessModule;
  try {
    Role.findOneAndUpdate(
      { _id: id },
      { $pull: { accessModule: remove_accessModule } },
      { new: true }
    )
      .then((updatedRole) => {
        res.send({ message: "Role was updated successfully." });
      })
      .catch((error) => {
        console.log("Error updating role:", error);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred.",
    });
  }
};


exports.addValueFromAccessModule = (req, res) => {
  const id = req.params.id;
  const remove_accessModule = req.body.accessModule;
  try {
    Role.findOneAndUpdate(
      { _id: id },
      { $push: { accessModule: remove_accessModule } },
      { new: true }
    )
      .then((updatedRole) => {
        res.send({ message: "Role was updated successfully." });
      })
      .catch((error) => {
        console.log("Error updating role:", error);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred.",
    });
  }
};