const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const strip = require('gulp-strip-comments');
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;

const browserSync = require('browser-sync').create();
      reload = browserSync.reload;

//this Gulp uses multiple dest for multiple outputs
//use gulp.dest for EACH location - .dest does not support [arrays]/'globbing'
//gulp-changed compares source files to existing, only updates changes

//initiate gulp - $ gulp watch - in job folder

//run SASS, compile, minify, auto-prefix, write sourcemaps
function css(){
   return gulp.src('./app/scss/**/*.scss')
          //sourcemaps allow browsers to map css origins
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(sass({
              //nested, expanded (bog standard), compact, compressed
              outputStyle: 'nested'
              })).on('error', sass.logError)
          //installs post-css prefixes for platforms under can-i-use
          .pipe(autoprefixer({
              browsers: ['last 2 versions'],
              cascade: false
              }))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('app/css'))
          .pipe(gulp.dest('dist/css'))
          .pipe(browserSync.stream());
}

//minify JS - concat is a possibility here
function compress() {
   return pipeline(
          gulp.src('app/js/*.js'),
          uglify(),
          gulp.dest('dist/js')
)}


// send copy of master page files on change to dist, strip notes
function copyMasters(){
    return gulp.src('app/**/*.php','app/**/*.html','!app/includes/dbconx.php')
          // .pipe(changed('app/**/*.html'))
          .pipe(changed('app/**'))
          .pipe(strip())
          .pipe(gulp.dest('dist'));
}

//process images
function imageMin(){
    return gulp.src(['app/img/*.png', 'app/img/*.svg', 'app/img/*.gif', '!app/img/unused'])
          //options - levels 1 - 7. 5 is relatively high
          .pipe(changed('app/img'))
          .pipe(imagemin([
              imagemin.gifsicle({interlaced:true}),
              imagemin.jpegtran({progressive:true}),
              imagemin.optipng({optimizationLevel:5})
          ]))
          .pipe(gulp.dest('dist/img'));
}

//Gulp watchers ,'app/scss/MaterializeGallery-sass/**/*.scss'
function watch(){
          browserSync.init({server: {baseDir: 'app'}});
          gulp.watch(['app/scss/components/**/*.scss','app/scss/alexPartials/**/*.scss'], css);
          gulp.watch('app/img/*', imageMin);
          gulp.watch('app/js/*', compress);
          gulp.watch(['app/**/*.html','app/**/*.php'], copyMasters);
          gulp.watch('app/**/*.html').on('change', browserSync.reload);
}


module.exports.copyMasters = copyMasters;
module.exports.compress = compress;
module.exports.css = css;
module.exports.imageMin = imageMin;
module.exports.watch = watch;
