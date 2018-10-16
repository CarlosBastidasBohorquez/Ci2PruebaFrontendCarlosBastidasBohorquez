/*
* Dependencias
*/
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

/*
* Configuración de la tarea 'tarea'
*/
gulp.task('myTask', function () {
    gulp.src('wwwroot/JS/app/app.js')
        .pipe(concat('appgulp.js'))
        .pipe(uglify())
        .pipe(gulp.dest('wwwroot/JS/appgulp/'))
}); 