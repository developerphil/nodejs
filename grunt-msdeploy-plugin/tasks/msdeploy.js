'use strict';
module.exports = function (grunt) {

    var exec = require('child_process').exec,
        path = require('path'),
        fs = require('fs'),
        mustache = require('mustache');

    var _ = grunt.util._;

    var callback = function(async, error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        if (error !== null) {
            console.log('stderr: ' + stderr);
            console.log('exec error: ' + error);
            async(false);
        }
        async();
    };

    var createAbsolutePath = function() {
        return function (path, render) {
            return process.cwd() + '\\' + render(path) + '\\';
        }
    };

    var gruntOptions = {
        stdout: true,
        stderr: true,
        failOnError: true,
        verbosity: 'normal',
        execOptions: {}
    };

    grunt.registerTask('archive', 'Archive IIS manifest', function () {
        var async = this.async();
        var options = this.options(gruntOptions);

        var config = grunt.config('msdeploy');

        if (config.files.manifest.length === 0) {
            console.log('Manifest is empty');
        }

        config.files.manifest = process.cwd() + '\\' + config.files.manifest;

        var script = "{{& dir.ms_deploy}}msdeploy.exe -verb:sync -disableLink:ContentExtension -source:manifest={{& files.manifest}} -dest:archiveDir={{& dir.archive}}";

        script = mustache.render(script, config);
        var asyncCallback = function(error, stdout, stderr){
            callback(async, error, stdout, stderr)
        };

        var cp = exec(script, options.execOptions, asyncCallback);
    });

    grunt.registerTask('create-parameters-file', 'Create Parameters File', function (env) {
        var config = grunt.config('msdeploy');
        var appRoot = process.cwd();
        var template = appRoot + '/' + config.dir.parameters + '/' + config.files.parameters.template;

        var output = fs.readFileSync(template, {encoding : 'utf8'});

        output = mustache.render(output, config.environments[env].parameters);

        var parameterOutput = appRoot + '/' + config.dir.parameters + '/parameters.xml';

        fs.writeFileSync(parameterOutput, output);
    });

    grunt.registerTask('package-config', 'Deploy Package Configuration', function(){
        var async = this.async();
        var options = this.options(gruntOptions);

        var config = grunt.config('msdeploy');
        config.absolute = createAbsolutePath;

        if (fs.existsSync(path)) {
            fs.mkdirSync(config.dir.packages);
        }

        var script = "{{& dir.ms_deploy}}msdeploy.exe -verb:sync -source:archiveDir={{#absolute}}{{& dir.archive}}{{/absolute}} -dest:package={{& dir.packages}}\\config-package.zip -declareParamFile=\"{{& dir.parameters}}/{{& files.parameters.declared}}\"";
        script = mustache.render(script, config);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});
    });


    grunt.registerTask('package-content', 'Package website content', function () {
        var async = this.async();
        var options = this.options(gruntOptions);

        var config = grunt.config('msdeploy');
        config.absolute = createAbsolutePath;

        var script = "{{& dir.ms_deploy}}msdeploy.exe -verb:sync -source:contentPath={{#absolute}}{{& dir.build}}{{/absolute}} -dest:package={{& dir.packages}}\\content-package.zip";
        script = mustache.render(script, config);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});

    });

    grunt.registerTask('deploy-config', 'Deploy Configuration Package', function (env) {
        var async = this.async();
        var options = this.options(gruntOptions);

        var config = grunt.config('msdeploy');
        config.current_environment = config.environments[env];

        var script = "{{& dir.ms_deploy}}msdeploy.exe -verb:sync -source:package={{& dir.packages}}\\config-package.zip -dest:auto={{& current_environment.config_deploy_path}},computerName={{& current_environment.server}} -setParamFile=\"{{& dir.parameters}}/parameters.xml\"";
        script = mustache.render(script, config);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});
    });

    grunt.registerTask('deploy-content', 'Deploy website content', function (env) {
        var async = this.async();
        var options = this.options(gruntOptions);

        var config = grunt.config('msdeploy');
        config.current_environment = config.environments[env];

        var script = "{{& dir.ms_deploy}}msdeploy.exe -verb:sync -source:package={{& dir.packages}}\\content-package.zip -dest:contentPath=\"{{& current_environment.deploy_path}}\",computerName={{& current_environment.server}}";
        script = mustache.render(script, config);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});
    });

};
