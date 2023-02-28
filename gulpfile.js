import gulp from "gulp";
import clean from "gulp-clean";
import browsersync from "browser-sync";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import concat from "gulp-concat";
import cleanCSS from "gulp-clean-css";
import autoprefixer from "gulp-autoprefixer";
import htmlmin from "gulp-htmlmin";
import minify from "gulp-minify";
import imagemin from "gulp-imagemin";

const { src, dest, series, parallel, watch } = gulp;
const sass = gulpSass(dartSass);

const cleanDist = () => {
  return src("./dist/**/*", { read: false }).pipe(clean());
};

const html = () => {
  return src("./src/index.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("./dist/"))
    .pipe(browsersync.stream());
};

const styles = () => {
  return src("./src/css/style.scss")
    .pipe(sass.sync({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: ["last 3 versions"],
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(dest("./dist/css/"))
    .pipe(browsersync.stream());
};

const scripts = () => {
  return src("./src/js/**/*.js")
    .pipe(minify())
    .pipe(dest("./dist/js/"))
    .pipe(browsersync.stream());
};

const images = () => {
  return src("./src/img/**/*.+(png|jpg|jpeg|gif|svg)")
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(dest("./dist/img"));
};

const server = () => {
  browsersync.init({
    server: {
      baseDir: `./dist`,
    },
    notify: false,
    port: 3000,
  });
};

const watchers = () => {
  watch("./src/**/*.scss", styles);
  watch("./src/**/*.html", html);
  watch("./src/**/*.js", scripts);
  watch("./src/img/**/*.+(png|jpg|jpeg|gif|svg)", images);
};

const dev = series(images, styles, scripts, html, parallel(watchers, server));

const build = series(cleanDist, images, styles, scripts, html);

export { dev, build };
