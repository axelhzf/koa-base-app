var Combine = require("stream-combiner");
var gulp = require("gulp");
var gutil = require("gulp-util");
var less = require("gulp-less");
var prefix = require("gulp-autoprefixer");
var jade = require("gulp-jade");
var gm = require("gulp-gm");
var imageResize = require("gulp-image-resize");
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var imagemin = require("gulp-imagemin");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var clean = require("gulp-clean");
var es = require("event-stream");
var ngHtml2Js = require("gulp-ng-html2js");
var ngmin = require("gulp-ngmin");
var jade = require("gulp-jade");
var cssmin = require("gulp-cssmin");
var iconfont = require("gulp-iconfont");
var iconfontCss = require("gulp-iconfont-css");
var consolidate = require("gulp-consolidate");

var folder = {
  src: {
    js: "app/client/",
    less: "app/client/less",
    views: "app/client/views"
  },
  dest: {
    less: "app/assets/style",
    js: "app/assets/js",
    views: "app/assets/views",
    fonts: "app/assets/fonts"
  }
};

gulp.task("less", function () {
  Combine(
    gulp.src(folder.src.less + "/contest.less"),
    less({ paths: ["./node_modules/"]}),
    prefix(),
    cssmin(),
    gulp.dest(folder.dest.less)
  ).on("error", gutil.log);

  Combine(
    gulp.src(folder.src.less + "/landing.less"),
    less({ paths: ["./node_modules/"]}),
    prefix(),
    cssmin(),
    gulp.dest(folder.dest.less)
  ).on("error", gutil.log)

});

gulp.task("views", function () {
  gulp.src(folder.src.views + "/**/*.jade")
    .pipe(jade())
    .pipe(gulp.dest(folder.dest.views))
});

gulp.task("images", function () {
  return gulp.src('app/assets/images/original/*')
    .pipe(gm(function (gmfile, done) {
      gmfile.size(function (err, size) {
        var width = Math.round(size.width * 0.67);
        var height = Math.round(size.height * 0.67);
        done(null, gmfile.resize(width, height));
      });
    }))
    .on("error", gutil.log)
    .pipe(gulp.dest('app/assets/images/large/'));
});

gulp.task("landing-images", function () {
  gulp.src("app/assets/images/original/landing/*")
    .pipe(gulp.dest("app/assets/images/large/landing/desktop/"));

  gulp.src('app/assets/images/original/landing/*')
    .pipe(gm(function (gmfile, done) {
      gmfile.size(function (err, size) {
        var width = 568;
        var height = 388;
        done(null, gmfile.resize(width, height));
      });
    }))
    .on("error", gutil.log)
    .pipe(gulp.dest('app/assets/images/large/landing/mobile/'));

  gulp.src('app/assets/images/original/landing/*')
    .pipe(gm(function (gmfile, done) {
      gmfile.size(function (err, size) {
        var width = 1024;
        var height = 700;
        done(null, gmfile.resize(width, height));
      });
    }))
    .on("error", gutil.log)
    .pipe(gulp.dest('app/assets/images/large/landing/laptop/'));

});

gulp.task("dist", ["less", "minimize"], function () {
  return gulp.src([
    "app/**",
    "migrations/**",
    "config/**",
    "./package.json",
    "!app/assets/images/original/**"
  ], { base: './' })
    .pipe(tar("martinmillerstrip.tar"))
    .pipe(gzip())
    .pipe(gulp.dest("out"));
});

gulp.task("default", ["less", "concat"]);

function landingSrc () {
  return gulp.src([
    "app/assets/components/jquery/dist/jquery.js",
    "app/assets/components/underscore/underscore.js",
    "app/assets/components/jquery-backstretch/src/jquery.backstretch.js",
    "app/assets/components/requestAnimationFrame-polyfill/requestAnimationFrame.js",
    "app/assets/components/jquery-smooth-scroll/jquery.smooth-scroll.js",
    "app/assets/components/media-match/media.match.js",
    "app/assets/components/enquire/dist/enquire.js",
    "app/assets/components/bootstrap/dist/js/bootstrap.js",
    "app/client/js/TypeWriter.js",
    "app/client/js/landing.js"
  ]);
}

function contestSrc () {
  return gulp.src([
    "app/assets/components/jquery/dist/jquery.js",
    "app/assets/components/underscore/underscore.js",
    "app/assets/components/angular/angular.js",
    "app/assets/components/ng-simplePagination/simplePagination.js",
    "app/assets/components/bootstrap-filestyle/src/bootstrap-filestyle.js",
    "app/assets/components/bootstrap/dist/js/bootstrap.js",
    "app/client/js/csphotoselector.js",
    "app/client/js/app.js",
    "app/client/js/RankingController.js",
    "app/client/js/SentenceController.js",
    "app/client/js/Share.js",
    "app/client/js/PhotosController.js",
    "app/client/js/ShareController.js",
    "app/client/js/image-picker.js",
    "app/client/js/ageCheck.js"
  ]);
}

gulp.task("minimize", function () {
  minimize(landingSrc(), "landing.js");
  minimize(contestSrc(), "contest.js");
});

gulp.task("concat", function () {
  landingSrc()
    .pipe(
      concat("landing.js"))
    .pipe(gulp.dest("app/assets/js"))
    .on("error", gutil.log);

  return contestSrc()
    .pipe(concat("contest.js"))
    .pipe(gulp.dest("app/assets/js"))
    .on("error", gutil.log);
});

function minimize (stream, dest) {
  stream
    .pipe(ngmin())
    .pipe(concat(dest))
    .pipe(uglify({outSourceMaps: true}))
    .pipe(gulp.dest("app/assets/js"))
}


gulp.task("icons", function () {
  return gulp.src(['app/client/icons/*.svg'])
    .pipe(iconfont({ fontName: 'icons' }))
    .on('codepoints', function(codepoints, options) {
      gulp.src('app/client/icons/icons.less')
        .pipe(consolidate('underscore', {
          glyphs: codepoints,
          fontName: 'icons',
          fontPath: '../fonts/',
          className: 's'
        }))
        .on("error", gutil.log)
        .pipe(gulp.dest('app/client/less'));
    })
    .pipe(gulp.dest('app/assets/fonts'));
});

gulp.task("watch", ["less", "views", "concat"], function () {
  gulp.watch(folder.src.less + "/**/*.less", ["less"]);
  gulp.watch(folder.src.views + "/**/*.jade", ["views"]);
  gulp.watch(folder.src.js + "/**/*.js", ["concat"]);
});