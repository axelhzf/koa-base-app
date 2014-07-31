var _ = require("underscore");
module.exports = function (Model, options) {

  function serialize(item) {
    var serialized = item.toJSON();
    if (options.fields) {
      serialized = _.pick(serialized, options.fields);
    } else if (options.excludeFields) {
      serialized = _.omit(serialized, options.excludeFields);
    }
    return serialized;
  }

  var resource = {
    list: function* () {
      var limit = parseInt(this.query.limit, 10) || 5;
      var offset = parseInt(this.query.offset, 10) || 0;

      var users = yield Model.findAndCountAll({limit: limit, offset: offset});

      var result = {
        limit: limit,
        offset: offset,
        total: users.count,
        items: _.map(users.rows, serialize)
      };

      this.body = result;
    },

    get: function* () {
      var id = parseInt(this.params["id"], 10);
      var user = yield Model.find(id);
      if (!user) {
        return this.throw("Resource doesn't exists", 404);
      }
      this.body = serialize(user);
    }
  };

  return resource;

};