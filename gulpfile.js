'use strict';

var gulp = require('gulp');
var inlineCss = require('gulp-inline-css'); //Инлайнит стили 
var sass = require('gulp-sass'); //Парсинг SASS в CSS
var pug = require('gulp-pug'); //Парсит Pug в HTML
var del = require('del'); //Удаление файлов и папок
var mail = require('gulp-mail'); //Отправка email сообщений

var browserSync = require("browser-sync").create(); //Локальный сервак
var reload = browserSync.reload;

var smtpInfo = { //Настройки SMTP для отправки сообщений
  auth: {
    user: 'your-email@yandex.ru', //Логин
    pass: 'password' //Пароль
  },
  host: 'smtp.yandex.ru', //SMTP сервер от любого сервиса
  secureConnection: true,
  port: 465
};

// Таск для работы Browsersync, автообновление браузера
gulp.task('serve', function () {
	browserSync.init({
		server: {
			baseDir: './app',
			index: 'index.html' //Интексный файл
		}
	});
  gulp.watch(['./app/pug/**/*.pug', './app/scss/**/*.scss'], gulp.series('build')); // Отслеживание изменений Pug и Sass-файлов
	gulp.watch('*.html').on('change', reload); // Обновление браузера
});

// Таск для работы Pug, преобразование Pug в HTML:
gulp.task('toHtml', function() {
  return gulp.src('./app/pug/e_*.pug') //Берет все файлы в названии которых есть префикс "e_"
    .pipe(pug({
      pretty: true, // Форматирование разметки в HTML-файле
      doctype: 'DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"' // Установка doctype
    }))
    .pipe(gulp.dest('./app/html')) //Сохранение преобразованных писем
    .pipe(browserSync.stream());
});

// Таск для работы Sass, преобразование Sass в CSS:
gulp.task('toCss', function() {
  return gulp.src('./app/scss/style.scss')
    .pipe(sass()) // Преобразование Sass в CSS
    .pipe(gulp.dest('./app/css')) // Сохранение CSS-файлов
    .pipe(browserSync.stream());
});

// Таск для очистки build папки:
gulp.task('clean', function() {
  return del('./build');
});

// Таск для формирования инлайн-стилей из внешнего CSS файла:
gulp.task('inline', function() {
  return gulp.src('./app/html/*.html') // Исходник для таска inline
    .pipe(inlineCss({ // Преобразование стилей из внешнего файла inline.css в инлайн-стили
        preserveMediaQueries: true, //Сохранение медиа-запросов в тегах style HTML-шаблона
        applyTableAttributes: true //Преобразование табличных стилей в атрибуты
    }))
    .pipe(gulp.dest('./build')) // Сохранение результатов в production-папку build
});

// Таск для сборки:
gulp.task('build', gulp.series('toHtml', 'toCss', 'clean', 'inline'));

// Таск для запуска разработки:
gulp.task('default', gulp.series('build', 'serve'));

// Таск для отправки собраных писаем
gulp.task('mail', function () {
  return gulp.src('./build/*.html')
    .pipe(mail({
      subject: 'Тестовое сообещние',
      to: [ //Спсок email адресов куда отправить письма
				// '@gmail.com',
				// '@mail.ru',
				// '@yandex.ru'
      ],
      from: 'Виктор <your-email@yandex.ru>',
      smtp: smtpInfo
    }));
});