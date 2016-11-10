const del           = require('del');
const gulp          = require('gulp');
const tsify         = require('tsify');
const source        = require('vinyl-source-stream');
const buffer        = require('vinyl-buffer');
const uglify        = require('gulp-uglify');
const browserify    = require('browserify');
const webserver     = require('gulp-webserver');
const cached        = require('gulp-cached');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('server', () => {
    gulp.src('dist')
        .pipe(webserver());
});

gulp.task('scripts', () => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/scripts/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify, { noImplicitAny: true })
    .bundle()
    .pipe(source('bundle.js'))
    // .pipe(buffer())
    // .pipe(uglify()) // TODO: Re-enable this after making source files
    .pipe(gulp.dest('dist'));
});

gulp.task('static', () => {
    return gulp.src(['src/static/**/*'])
        .pipe(gulp.dest('dist'));
});

gulp.task('default',
    gulp.series(
        gulp.parallel(
            'static',
            gulp.series('scripts', (done) => {
                gulp.watch('src/scripts/**/*', gulp.parallel('scripts'))
                gulp.watch('src/static/**/*', gulp.parallel('static'))
                done();
            })
        ),
        'server'
    )
);