const mongoose = require("mongoose");
const Role = require("../schemas/roles");

const seedRoles = async () => {
  try {
    const roles = ["admin", "user"];

    for (let roleName of roles) {
      const exist = await Role.findOne({ name: roleName });

      if (!exist) {
        await Role.create({
          name: roleName,
          description: `${roleName} role`
        });
        console.log(`Created role: ${roleName}`);
      } else {
        console.log(`Role already exists: ${roleName}`);
      }
    }

    console.log("Seed roles done!");
  } catch (error) {
    console.error("Seed roles error:", error);
  }
};

module.exports = seedRoles;