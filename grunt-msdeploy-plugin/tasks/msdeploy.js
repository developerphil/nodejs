'use strict';
module.exports = function (grunt) {

    var exec = require('child_process').exec,
        path = require('path'),
        fs = require('fs'),
        mustache = require('mustache');

    var _ = grunt.util._;

    var callback = function(async, error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
            async(false);
        }
        async();
    };

    var gruntOptions = {
        stdout: true,
        stderr: true,
        failOnError: true,
        execOptions: {}
    };

    /*var options = this.options({
     stdout: false,
     stderr: true,
     targets: ['Build'],
     buildParameters: {},
     failOnError: true,
     verbosity: 'normal',
     processor: '',
     version: 4.0,
     nologo: true
     });*/

    grunt.registerTask('archive', 'Archive IIS manifest', function () {
        var async = this.async();
        var options = this.options(gruntOptions);

        var parameters = grunt.config('msdeploy.all.locations');
        if (parameters.manifest.length === 0) {
            console.log('Manifest is empty');
        }

        var script = "{{& msdeploy}} -verb:sync -disableLink:ContentExtension -source:manifest={{& manifest}} -dest:archiveDir={{& archive}}";

        script = mustache.render(script, parameters);
        var asyncCallback = function(error, stdout, stderr){
            callback(async, error, stdout, stderr)
        };

        var cp = exec(script, options.execOptions, asyncCallback);
    });

    grunt.registerTask('create-parameters-file', 'Create Parameters File', function (env) {
        var environment = grunt.config('msdeploy.' + env.toString());
        var parameters = grunt.config('msdeploy.all.locations');

        var output = fs.readFileSync(parameters.template, {encoding : 'utf8'});
        output = mustache.render(output, environment);

        fs.writeFileSync(parameters.parameters, output);
    });

    grunt.registerTask('package-config', 'Deploy Package Configuration', function(env){
        var async = this.async();
        var options = this.options(gruntOptions);

        var parameters = grunt.config('msdeploy.all.locations');

        var script = "{{& msdeploy}} -verb:sync -source:archiveDir={{& archive}} -dest:package={{& configpackage}} -declareParamFile=\"{{& declaredparameters}}\"";
        script = mustache.render(script, parameters);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});
    });

    grunt.registerTask('msdeploy-deployer-config', 'Deploy Configuration Package', function () {
        var async = this.async();
        var options = this.options(gruntOptions);

        var parameters = grunt.config('msdeploy.all.locations');

        var script = "{{& msdeploy}} -verb:sync -source:package={{& configpackage}} -dest:auto=true -setParamFile=\"{{& parameters}}\"";
        script = mustache.render(script, parameters);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});
    });

    grunt.registerTask('package-content', 'Package website content', function () {
        var async = this.async();
        var options = this.options(gruntOptions);

        var parameters = grunt.config('msdeploy.all.locations');

        var script = "{{& msdeploy}} -verb:sync -source:contentPath={{& build}} -dest:package={{& contentpackage}}";
        script = mustache.render(script, parameters);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});

    });

    grunt.registerTask('deploye-content', 'Deploy website content', function () {
        var async = this.async();
        var options = this.options(gruntOptions);

        var parameters = grunt.config('msdeploy.all.locations');

        var script = "{{& msdeploy}} -verb:sync -source:package={{& contentpackage}} -dest:contentPath=\"{{& publishpath}}\",computerName={{& server}}";
        script = mustache.render(script, parameters);

        var cp = exec(script, options.execOptions, function(error, stdout, stderr){callback(async, error, stdout, stderr)});

    });

};
