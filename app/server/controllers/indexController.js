exports.index = function* () {
  yield this.render("index/index");
};

exports.private = function* () {
  yield this.render("index/private");
};