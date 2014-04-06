# grunt-msdeploy

> msdeploy Grunt plugin.

## Getting Started
This plugin requires Grunt '~0.4.2' and "mustache": '~0.8.1'

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

### Overview
In your project's Gruntfile, add a section named `msdeploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    msdeploy: {
        dir: {
            ms_deploy: 'C:\\"Program Files"\\IIS\\"Microsoft Web Deploy V3"\\', /* msdeploy location */
            archive: 'archive', /* iis archive folder */
            parameters: 'parameters',  /* parameters folder */
            packages: 'packages',
            build: 'build'
        },
        files: {
            manifest: 'manifest\\manifest.xml', /* manifest location */
            /*parameter files*/
            parameters: {
                declared:"declared-parameters.xml",
                template:"parameters.template"
            }
        },
        environments: {
            development: {
                /* environment parameter files */
                parameters: {
                    parameter1:"parameter1",
                    parameter2:"parameter2"
                },
                /* machine to deploy */
                server: 'local-machine',
                /* deploy location */
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
```