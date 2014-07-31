exports.render = function (templateName) {
  return function* () {
    yield this.render(templateName);
  }
};