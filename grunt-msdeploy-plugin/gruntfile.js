
module.exports = function(grunt) {
    grunt.initConfig({
        msdeploy: {
            dir: {
                ms_deploy: 'C:\\"Program Files"\\IIS\\"Microsoft Web Deploy V3"\\', /* msdeploy location */
                archive: 'archive',
                parameters: 'parameters',
                packages: 'packages',
                build: 'build'
            },
            files: {
                manifest: 'manifest\\manifest.xml',
                parameters: {
                    declared:"declared-parameters.xml",
                    template:"parameters.template"
                }
            },
            environments: {
                development: {
                    parameters: {
                        parameter1:"parameter1",
                        parameter2:"parameter2"
                    },
                    server: 'local-machine',
                    deploy_path:'C:\\Website\\',
                    config_deploy_path:'C:\\config\\'
                },
                live: {
                    parameters: {
                        parameter1:"parameter1",
                        parameter2:"parameter2"
                    },
                    server: 'liveserver',
                    deploy_path:'E:\\Website\\',
                    config_deploy_path:'E:\\config\\'
                }
            }
        }
    });

    grunt.task.loadTasks('node_modules/grunt-msdeploy/tasks/');

    grunt.registerTask('package', 'package site', function(env) {
        if (env == null) {
            grunt.warn('env is null');
        }

        grunt.task.run('create-parameters-file:' + env, 'archive', 'package-config', 'package-content');
    });

    grunt.registerTask('deploy', 'deploy site', function(env) {
        if (env == null) {
            grunt.warn('env is null');
        }

        grunt.task.run('deploy-config:' + env,'deploy-content:' + env);
    });
}