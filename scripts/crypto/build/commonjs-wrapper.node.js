var fs = require('fs');
var path = require('path');

/**
 * Wrap a javascript file with a CommonJS compatible module definiton
 */
var WrapFile = function WrapFile(file, output, exports, imports, dependencies, callback){
    fs.readFile(file, function(err, data){
        if(err) { callback(err); return; }
        
        
        // exports to define
        var exports_str = '';
        if(typeof exports === 'object') {
            var define = [];
            for(var prop in exports){
                if(exports.hasOwnProperty(prop) && prop !== '.depends'){
                    define.push(prop + ': ' + exports[prop]);
                }
            }
            
            exports_str = 'return {'+ define.join('\n,') +'};';
        } else if(typeof exports === 'string'){
            exports_str = 'return '+ exports +';';
        } else {
            throw new Error('Cannot export unknown type');
        }
        
        var imports_str = '';
        console.log(imports instanceof Array);
        if(imports instanceof Array) {
            imports_str = imports.join(';\n') + ';\n';
            console.log(imports_str);
        }
        
        // Construct the CommonJS module definition
        // (Modules/AsynchronousDefinition)

        var wrappedScript = null;
        if(dependencies) {
            var dep_modules = [];
            var dep_params = [];
            for(var dep_prop in dependencies){
                if(dependencies.hasOwnProperty(dep_prop)){
                    dep_modules.push(dependencies[dep_prop]);
                    dep_params.push(dep_prop);
                }
            }
            
            wrappedScript = ['define(' + "['" + dep_modules.join("', '") + "']"
                             , ', function('+ dep_params.join(', ') +'){'
                             , imports_str
                             , data
                             , exports_str
                             , '});\n'];
        } else {
            wrappedScript = ['define(function(){'
                             , imports_str
                             , data
                             , exports_str
                             , '});\n'];
        }
        
        wrappedScript.unshift('//\n// AUTO-GENERATED FROM ' + file + ' __DO NOT EDIT__\n//\n')
        
        fs.writeFile(output + '/' + path.basename(file)
                     , wrappedScript.join('\n')
                     , function(err){
                         callback(err, output + '/' + file);
                     });
    });
};

/**
 * Wrap lots of files with CommonJS module definitions
 */
var Wrap = function Wrap(root, output, obj, callback){
    var running = 0;
    var scripts = [];
    
    function script_done(err, script){
        --running;
        
        if(!err) {
            scripts.push(script);
        } else {
            callback(err);
            callback = function(){};
        }
        
        if(running === 0) { callback(null, scripts); }
    }

    for(file in obj) {
        if(obj.hasOwnProperty(file)) {
            ++running;
            WrapFile(root + '/' + file
                     , output
                     , obj[file]['.exports']
                     , obj[file]['.imports']
                     , obj[file]['.depends']
                     , script_done);
        }
    }
};

exports.WrapFile = WrapFile;
exports.Wrap = Wrap;
