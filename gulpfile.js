var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    wpPot = require('gulp-wp-pot'),
    clean = require('gulp-clean'),
    zip = require('gulp-zip'),
    fs = require('fs'),
    path = require('path'),
	rename = require("gulp-rename"),
	sass = require('gulp-sass')(require('node-sass'));
    build_name = 'hr-management-' + require('./package.json').version + '.zip';

var onError = function (err) {
    notify.onError({
        title: 'Gulp',
        subtitle: 'Failure!',
        message: 'Error: <%= error.message %>',
        sound: 'Basso'
    })(err);
    this.emit('end');
};

var added_texts = [];
const regex = /__\(\s*'([^']*)'\s*\)/g;
const js_files = ['hrm', 'careers', 'settings', 'addons-page'].map((f) => 'dist/' + f + '.js:1').join(', ');
function i18n_makepot(target_dir) {
    const parent_dir = target_dir || __dirname;
    var translation_texts = '';

    // Loop through JS files inside js directory
    fs.readdirSync(parent_dir).forEach(function (file_name) {
        var full_path = parent_dir + '/' + file_name;

		if ( full_path.indexOf('node_modules')>-1 || full_path.indexOf('vendor')>-1 ) {
			return;
		}

        var stat = fs.lstatSync(full_path);
        if (stat.isDirectory()) {
            i18n_makepot(full_path);
            return;
        }

        // Make sure only js extension file to process
        if (stat.isFile() && path.extname(file_name) == '.jsx') {
            var codes = fs.readFileSync(full_path).toString();

            let match;
            while ((match = regex.exec(codes)) !== null) {
                let text = match[1];

                // Avoid duplicate entry
                if (added_texts.indexOf(text) > -1) {
                    continue;
                }

                added_texts.push(text);
                translation_texts +=
                    '\n#: ' + js_files + '\nmsgid "' + text + '"\nmsgstr ""' + '\n';
            }
        }
    });

    // Finally append the texts to the pot file
    fs.appendFileSync(
        __dirname + '/languages/hr-management.pot',
        translation_texts.replaceAll('../CrewHRM-Pro/', '../hr-management-pro/')
    );
}

function i18n_makepot_init(callback) {
	i18n_makepot(path.resolve(__dirname) );
	i18n_makepot(path.resolve(__dirname + '/../CrewHRM-Pro') );
	i18n_makepot(path.resolve(__dirname + '/../Materials') );

	if ( typeof callback === 'function' ) {
		callback();
	}
}

gulp.task('makepot', function () {
    return gulp
        .src(['**/*.php', '../CrewHRM-Pro/**/*.php'])
        .pipe(
            plumber({
                errorHandler: onError
            })
        )
        .pipe(
            wpPot({
                domain: 'hr-management',
                package: 'CrewHRM'
            })
        )
        .pipe(gulp.dest('languages/hr-management.pot'));
});

/**
 * Build
 */
gulp.task('clean-zip', function () {
    return gulp
        .src('./' + build_name, {
            read: false,
            allowEmpty: true
        })
        .pipe(clean());
});

gulp.task('clean-build', function () {
    return gulp
        .src('./build', {
            read: false,
            allowEmpty: true
        })
        .pipe(clean());
});

gulp.task('copy', function () {
    return gulp
        .src([
            './**/*.*',
            '!./components/**',

            '!./dist/**/*.map',
            '!./dist/**/*.txt',
            '!./node_modules/**',
            '!./svn-push/**',
            '!./tests/**',

            '!./vendor/**',

            '!.github',
            '!.git',
			
            '!./**/*.zip',
            '!./readme.md',
            '!./release.sh',
            '!.DS_Store',
            '!./**/.DS_Store',
            '!./LICENSE.txt',
            '!./*.lock',
            '!./*.js',
            '!./*.json',
            '!./*.xml'
        ])
        .pipe(gulp.dest('build/hr-management/'));
});

gulp.task('make-zip', function () {
	// Replace the mode in build folder
	const index_path = path.resolve( __dirname+'/build/hr-management/hr-management.php' );
	const codes      = fs.readFileSync(index_path).toString().replace( "=> 'development',", "=> 'production'," );
	fs.writeFileSync(index_path, codes);
	
    return gulp.src('./build/**/*.*').pipe(zip(build_name)).pipe(gulp.dest('./'));
});

exports.build = gulp.series(
    'clean-zip',
    'clean-build',
    'makepot',
    i18n_makepot_init,
    'copy',
    'make-zip',
    'clean-build',
);
