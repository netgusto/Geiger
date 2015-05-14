var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
var print = require('gulp-print');

var src = ['src/**/*.js'];

var build = function(done) {
    gulp.src(src)
        .pipe(print())
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failAfterError())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
        .on('end', done);
}

var lint = function(done) {
    gulp.src(src)
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failAfterError())
        .on('end', done);
}

gulp.task('build', function(done) {
    build(done);
});

gulp.task('lint', function(done) {
    lint(done);
});