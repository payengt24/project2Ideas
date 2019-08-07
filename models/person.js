module.exports = function(sequelize, DataTypes) {
  var Person = sequelize.define("Person", {
    text: DataTypes.STRING,
    description: DataTypes.TEXT
  });
  return Person;
};
