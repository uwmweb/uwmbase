/* eslint-env node, es6 */
/* global Promise */
/* eslint-disable key-spacing, one-var, no-multi-spaces, max-nested-callbacks, quote-props */

'use strict';

// ################################
// Load Gulp and tools we will use.
// ################################
var gulp      = require('gulp'),
  $           = require('gulp-load-plugins')(),
  browserSync = require('browser-sync').create(),
  del         = require('del'),
  magicImporter = require('node-sass-magic-importer'),
  kss         = require('kss'),
  path = require('path'),
  gulpStylelint = require('gulp-stylelint');
// #############################
// Set paths and options
// #############################

var options = {};

options.theme = {
  name       : 'uwmbase',
  source     : {
    base        : 'src/',
    components  : 'components/',
    scss        : 'src/scss/',
    js          : 'src/js/',
    styleguide  : 'src/styleguide/',
    bootstrapjs : 'node_modules/bootstrap/js/dist',
    assets      : 'src/assets/',
  },
  build      : {
    base        : 'dist/',
    css         : 'dist/css/',
    js          : 'dist/js/',
    styleguide  : 'dist/styleguide/',
    bootstrapjs : 'dist/vendor/bootstrap/js/',
    assets      : 'dist/assets',
  }
};

// Set the URL used to access the Drupal website under development. This will
// allow Browser Sync to serve the website and update CSS changes on the fly.
options.drupalURL = 'http://uwmed.local';
// options.drupalURL = 'http://localhost';

// Define the node-sass configuration. The includePaths is critical!
// We're using node-sass-tilde-importer which turns ~ into absolute paths to
// the nearest parent node_modules directory.
//
// This allows us to load bootstrap sass files with: @import ~/bootstrap/scss/file
options.sass = {
  importer: magicImporter(),
  includePaths: [
    options.theme.source.scss,
    options.theme.source.components
  ],
  outputStyle: 'expanded'
};

// Define which browsers to add vendor prefixes for.
options.autoprefixer = {
  browsers: [
    'last 2 versions',
    'ios >= 8'
  ]
};

// Define the style guide paths and options.
options.styleGuide = {
  source: [
    options.theme.source.styleguide,
    options.theme.source.scss,
    options.theme.source.components
  ],
  destination: options.theme.build.styleguide,

  builder: 'builder/twig',
  namespace: options.theme.name + ':' + options.theme.source.components,
  'extend-drupal8': true,

  // The css and js paths are URLs, like '/misc/jquery.js'.
  // The following paths are relative to the generated style guide.
  css: [
    // google fonts
    'https://fonts.googleapis.com/css?family=Encode+Sans:300,400,500,600,700|Open+Sans:400,400i,600,600i,700,700i',
    // base/special stylesheets
    path.relative(options.theme.build.styleguide, options.theme.build.css + 'kss-only.css'),
    path.relative(options.theme.build.styleguide, options.theme.build.css + 'base.css'),
    // component stylesheets
    path.relative(options.theme.build.styleguide, options.theme.build.css + 'header.css'),
    path.relative(options.theme.build.styleguide, options.theme.build.css + 'provider-card.css'),
    path.relative(options.theme.build.styleguide, options.theme.build.css + 'modal-video.css')
  ],
  js: [
    // use drupal's version of jquery and add Drupal
    '/core/assets/vendor/jquery/jquery.min.js',
    '/core/misc/drupal.js',
    // fontawesome
    'https://use.fontawesome.com/releases/v5.3.1/js/all.js',
    // bootstrap
    path.relative(options.theme.build.styleguide, options.theme.build.bootstrapjs + 'util.js'),
    path.relative(options.theme.build.styleguide, options.theme.build.bootstrapjs + 'alert.js'),
    path.relative(options.theme.build.styleguide, options.theme.build.bootstrapjs + 'modal.js'),
    path.relative(options.theme.build.styleguide, options.theme.build.bootstrapjs + 'collapse.js'),
    // components js
    path.relative(options.theme.build.styleguide, options.theme.build.js + 'modal-video.js')
  ],

  homepage: 'homepage.md',
  title: 'UW Medicine Base Theme Style Guide'
};

// Define the paths to the JS files to lint.
options.eslint = {
  files  : [
    // options.rootPath.project + 'gulpfile.js',
    options.theme.source.js + '*.js',
    '!' + options.theme.source.js + '**/*.min.js',
    options.theme.components + '**/*.js',
    '!' + options.components + '**/*.min.js',
    options.theme.build.js + '**/*.js',
    '!' + options.theme.build.js + '**/*.js'
  ]
};

// If your files are on a network share, you may want to turn on polling for
// Gulp watch. Since polling is less efficient, we disable polling by default.
options.gulpWatchOptions = {};
// options.gulpWatchOptions = {interval: 1000, mode: 'poll'};


// #########################
// Lint Sass and JavaScript.
// #########################

// Lint JavaScript.
gulp.task('lint:js', function () {
  return gulp.src(options.eslint.files)
    .pipe($.eslint({
      useEslintrc: true,
      envs: ['mocha', 'node', 'es6'],
      fix: true
    }))
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

// Lint Sass and throw an error for a CI to catch..
gulp.task('lint:styles', function () {
  return gulp.src([
    options.theme.source.components + '**/*.scss'
  ])
    .pipe(gulpStylelint({
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'string', console: true},
        {formatter: 'verbose', save: 'config-standard-verbose.txt'}
      ]
    }));
});

gulp.task('lint', gulp.series('lint:styles', 'lint:js'));


// ##############################
// Watch for changes and rebuild.
// ##############################


// gulp.task('watch:css', gulp.series('styles', function () {
//   return gulp.watch(options.theme.source.components + '**/*.scss', options.gulpWatchOptions, ['styles']);
// }));

// gulp.task('browser-sync', gulp.series('watch:css', function () {
//   if (!options.drupalURL) {
//     return Promise.resolve();
//   }
//   return browserSync.init({
//     proxy: options.drupalURL,
//     noOpen: false
//   });
// }));

// gulp.task('watch:lint-and-styleguide', gulp.series('styleguide', 'lint:sass', function () {
//   return gulp.watch([
//     options.theme.source.components + '**/*.scss',
//     options.theme.source.components + '**/*.twig'
//   ], options.gulpWatchOptions, ['styleguide', 'lint:sass']);
// }));

// gulp.task('watch:js', ['lint:js'], function () {
//   return gulp.watch(options.eslint.files, options.gulpWatchOptions, ['lint:js']);
// });
// gulp.task('watch:js', gulp.series('js', function () {
//   return gulp.watch([options.theme.source.components + '**/*.js',options.theme.source.js + '**/*.js'], options.gulpWatchOptions, ['js']);
// }));

// gulp.task('watch', gulp.series('browser-sync', 'watch:lint-and-styleguide', 'watch:js'));


// ######################
// Clean all directories.
// ######################

// Clean style guide files.
gulp.task('clean:styleguide', function () {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del([
    options.styleGuide.destination + '*.html',
    options.styleGuide.destination + 'kss-assets',
    options.theme.build.base + 'twig/*.twig'
  ], {force: true});
});

// Clean style files.
gulp.task('clean:styles', function () {
  return del([
    options.theme.build.css + '**/*.css',
    options.theme.build.css + '**/*.map'
  ], {force: true});
});

// Clean JS files.
gulp.task('clean:js', function () {
  return del([
    options.theme.build.js + '**/*.js',
    options.theme.build.js + '**/*.map'
  ], {force: true});
});

// Clean Asset files.
gulp.task('clean:assets', function () {
  return del([
      options.theme.build.assets + '**/*.*'
  ], {force: true});
});

gulp.task('clean', gulp.parallel('clean:styleguide', 'clean:styles', 'clean:js', 'clean:assets'));


// ################################
// Compile, minify, and move files.
// ################################

gulp.task('compile:assets', function () {
  return gulp.src([
    options.theme.source.assets + '**/*.*',
    options.theme.source.components + '**/*.css'
  ])
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [{
          removeViewBox: false
      }]
  }))  
    .pipe(gulp.dest(options.theme.build.assets));
});

gulp.task('compile:styleguide', function () {
  return kss(options.styleGuide);
});

// Debug the generation of the style guide with the --verbose flag.
gulp.task('styleguide:debug', function () {
  options.styleGuide.verbose = true;
  return kss(options.styleGuide);
});


gulp.task('js:vendor', function() {
  return gulp.src([
    options.theme.source.bootstrapjs + '**/*.js'
  ])
    .pipe($.rename({dirname: ''}))
    .pipe(gulp.dest(options.theme.build.bootstrapjs));
});

gulp.task('compile:js', function () {
  return gulp.src([
    options.theme.source.components + '**/*.js',
    options.theme.source.js + '**/*.js'
  ])
    .pipe($.sourcemaps.init())
    .pipe($.rename({dirname: ''}))
    .pipe($.babel({
        presets: ['babel-preset-env']
    }))
    .pipe($.include())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(options.theme.build.js))
    .pipe($.if(browserSync.active, browserSync.stream({match: '**/*.js'})));
});


// ##########
// Compile CSS.
// ##########
const sassFiles = [
  options.theme.source.scss + '**/*.scss',
  options.theme.source.components + '**/*.scss',
  options.theme.source.styleguide + '*.scss',
  // Do not open Sass partials as they will be included as needed.
  '!' + options.theme.source.scss + '**/_*.scss',
  '!' + options.theme.source.components + '**/_*.scss',
  '!' + options.theme.source.styleguide + '_*.scss'
];

gulp.task('compile:styles', function () {
  return gulp.src(sassFiles)
    .pipe($.sourcemaps.init())
    .pipe($.sass(options.sass).on('error', $.sass.logError))
    .pipe($.autoprefixer(options.autoprefixer))
    .pipe($.rename({dirname: ''}))
    .pipe($.size({showFiles: true}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(options.theme.build.css))
    .pipe($.if(browserSync.active, browserSync.stream({match: '**/*.css'})));
});


// ###################################
// Composite tasks based on file type.
// ###################################
gulp.task('assets', gulp.series('clean:assets', 'compile:assets'));
gulp.task('js', gulp.series('clean:js', 'lint:js', 'compile:js', 'js:vendor'));
gulp.task('styleguide', gulp.series('clean:styleguide', 'compile:styleguide'));
gulp.task('styles', gulp.series('clean:styles', 'lint:styles', 'compile:styles'));

// ################################
// Composite tasks based on action.
// ################################
gulp.task('clean', gulp.parallel('clean:styles', 'clean:js', 'clean:assets', 'clean:styleguide'));
gulp.task('lint', gulp.parallel('lint:styles', 'lint:js'));
gulp.task('compile', gulp.parallel('compile:styles', 'compile:js', 'compile:assets', 'compile:styleguide'));


// #################
// Build everything.
// #################
gulp.task('build', gulp.series('clean', 'lint', 'compile'));
//gulp.task('build:production', gulp.series('styles:production', 'js:production', 'images', 'styleguide', 'lint', 'assets'));

// The default task.
gulp.task('default', gulp.series('build'));