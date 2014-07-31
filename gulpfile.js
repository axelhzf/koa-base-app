var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var es6ify = require("es6ify");
var jadeify = require("jadeify");
var less = require("gulp-less");
var autoprefixer = require("gulp-autoprefixer");

gulp.task("less", function () {
  gulp.src("app/client/style/admin.less")
    .pipe(less({
      paths: ["node_modules"]
    }))
    .pipe(autoprefixer())
    .on("error", gutil.log)
    .pipe(gulp.dest("./app/.assets/style/"));
});

gulp.task("font-awesome-icons", function () {
  gulp.src("node_modules/font-awesome/fonts/*")
    .pipe(gulp.dest("app/.assets/fonts"));
});

gulp.task('watch', function () {
  gulp.watch("app/client/style/*.less", ["less"]);

  var bundler = watchify('./app/client/js/admin/admin.js')
    .transform(es6ify)
    .transform(jadeify)
    .on('update', rebundle)
    .on("log", gutil.log);

  function rebundle () {
    return bundler.bundle({ debug: true })
      .on('error', function (e) {
        gutil.log('Browserify Error', e);
      })
      .pipe(source('admin.js'))
      .pipe(gulp.dest('./app/.assets/js/admin/'))
  }

  return rebundle()
});