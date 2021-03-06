var gulp        = require('gulp');
var slim        = require("gulp-slim");
var sass        = require('gulp-sass');
var browserSync = require('browser-sync');
var prefix      = require('gulp-autoprefixer');
var cleanCSS    = require('gulp-clean-css');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var out         = require('gulp-out');
var runSequence = require('run-sequence');
var del         = require('del');

// Runs browserSync (reloads your page after file changes)
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    port: 8000,
    notify: false
  })
});

// Deletes the whole dist folder (a.k.a directory cleaning)
gulp.task('clean:dist', function() {
  return del.sync('./dist/*');
});

// Slim preprocessor
gulp.task('slim', function(){
  gulp.src("./app/slim/*.slim")
    .pipe(slim({
      pretty: true
    }))
    .pipe(gulp.dest("./dist/"))
    // .pipe(browserSync.reload({stream:true})); // Reloads browser after processing
});

// Sass preprocessor
gulp.task('sass', function(){
  return gulp.src('./app/assets/stylesheets/main.sass')
    .pipe(sass({
      includePaths: ['./app/assets/stylesheets'],
      onError: browserSync.notify
    }))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Prefixes vendor shit on css for compatibility
    .pipe(gulp.dest('./app/assets/stylesheets'))
    .pipe(cleanCSS()) // Minify css for production
    .pipe(out('./dist/{basename}.min{extension}')) // add '.min.css'
    // .pipe(browserSync.reload({stream: true}));
});

// Concatenates all js files and minifies it using uglifier
gulp.task('js', function() {
  gulp.src(['./app/assets/javascript/index.js', 'app/assets/javascript/**/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(out('./dist/{basename}.min{extension}'))
    // .pipe(browserSync.reload({stream:true}));
});

// Listens/Watchers for changes and reloads
gulp.task('watch', function (){
  gulp.watch('./app/assets/stylesheets/**', ['sass']);
  gulp.watch('./app/slim/**', ['slim']);
  gulp.watch('./app/assets/javascript/**', ['js']);
  gulp.watch('./dist/*', browserSync.reload);
});

// Wipes dist folder and repopulates (remove non-used files)
gulp.task('rebuild', function (callback) {
  runSequence('clean:dist', ['sass', 'slim', 'js'], callback);
});

gulp.task('default', function (callback) {
  runSequence(['browserSync', 'watch', 'sass', 'slim', 'js'], callback);
});
