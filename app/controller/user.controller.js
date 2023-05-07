const { query } = require("express");
const User = require("../model/user.module");
const jwt = require("jsonwebtoken");
let _ = require("lodash");
const mongoose = require("mongoose");

exports.signup = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a User
  const user = new User({
    name: req.body.name,
    gender: req.body.gender,
    isActive: req.body.isActive ? req.body.isActive : false,
    email: req.body.email,
    password: req.body.password,
    roleId: req.body.roleId,
  });

  // Save User in the database
  user
    .save(user)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the User.",
      });
    });
};

exports.login = async (req, res) => {
  // Validate request
  if (!req.body.email) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.json({ token });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while creating the User.",
    });
  }
};

// Retrieve all Users from the database.
exports.findAll = async (req, res) => {
  let name = req.query.name;
  let where = {};
  if (name) where.name = new RegExp(_.escapeRegExp(name), "i");
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          gender: 1,
          role: {
            _id: 1,
            roleName: 1,
            accessModule: 1,
          },
        },
      },
      {
        $match: where,
      },
    ]).exec();
    res.send({ list: users });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving users.",
    });
  }
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found User with id " + id });
      else res.send({ user: data });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving User with id=" + id });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User with id=${id}. Maybe User was not found!`,
        });
      } else res.send({ message: "User was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`,
        });
      } else {
        res.send({
          message: "User was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Users were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all ps.",
      });
    });
};

exports.updateMany = async (req, res) => {
  let prefix = req.body.prefix,
    suffix = req.body.suffix,
    field = req.body.field;

  // Update all users whose name starts with "abs" by appending "abc" to their name.

  try {
    const query = { [field]: new RegExp(`^${prefix}`) };
    const update = [
      {
        $set: {
          [field]: {
            $concat: [{ $toString: `$${field}` }, suffix],
          },
        },
      },
    ];
    const options = { new: true, multi: true };
    await User.updateMany(query, update, options).exec();
    res.send({ message: "Users was updated successfully." });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while fetching the User.",
    });
  }
};

exports.updateManyUsers = async (req, res) => {
  const fieldUpdates = [];

  req.body.users.forEach((element) => {
    let field = "";
    if (element.email) {
      field = "email";
    } else if (element.gender) {
      field = "gender";
    } else if (element.name) {
      field = "name";
    }
    fieldUpdates.push({
      filter: { name: new RegExp(_.escapeRegExp(element.name), "i") },
      update: {
        $set: {
          [field]: element.email
            ? element.email
            : element.gender
            ? element.gender
            : element.name
            ? element.name
            : "",
        },
      },
    });
  });

  try {
    const bulkOperations = fieldUpdates.map(({ filter, update }) => ({
      updateOne: { filter, update },
    }));

    User.bulkWrite(bulkOperations);

    res.send({ message: "Users was updated successfully." });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while fetching the User.",
    });
  }
};

exports.checkAccessModule = async (req, res) => {
  const id = req.params.id;

  const moduleName = req.body.moduleName;

  User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $match: {
        "role.accessModule": moduleName,
      },
    },
  ])
    .then((usersWithAccess) => {
      if (usersWithAccess.length > 0) {
        res.send({ user: usersWithAccess });
      } else {
        res.send({
          message: "Users does not have access to " + moduleName + " module.",
        });
      }
    })
    .catch((error) => {
      console.log("Error checking user access:", error);
    });
};
