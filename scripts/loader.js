var loadUnhosted = null;
(function(){
    function createXMLHTTPObject() {
        var XMLHttpFactories = [
            function () {return new XMLHttpRequest()},
            function () {return new ActiveXObject("Msxml2.XMLHTTP")},
            function () {return new ActiveXObject("Msxml3.XMLHTTP")},
            function () {return new ActiveXObject("Microsoft.XMLHTTP")}
        ];
        var xmlhttp = null;
        for (var i=0; i < XMLHttpFactories.length ;i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            } catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    }

    function request(url, callback) {
        var req = createXMLHTTPObject();
        if (!req) { return null; }

        req.open('GET', url, true);
        req.send();
        req.onreadystatechange = function(){
            if (req.readyState != 4) return;

            if (req.status != 200 && req.status != 304) {
                callback(new Error('HTTP Request failed with code '
                                   + req.status));
            }
            callback(null, req);
        }
    }
    
    function injectScript(fileUrl, source) {
        var head = document.getElementsByTagName('head').item(0);
        var script = document.createElement('script');
        script.language = "javascript";
        script.type = "text/javascript";
        script.defer = true;
        script.text = source;
        head.appendChild(script);
    } 
    
    function loadScripts(options, callback) {
        var scripts = options.scripts;
        var initScript = options.initScript;

        var running = 0;
        var loaded = 0;
        var errored = false;

        var initScript_src = null;


        function checkErr(err, script) {
            if(err) {
                if(!errored) {
                    callback(err);
                }
                console.error('Error loading script ' + script);
                errored = true;
                return true;
            }
            return false;
        }

        // After all other scripts have been loaded invoke this function to load
        // the initScript
        function allDone(){
            injectScript(initScript, initScript_src);
            callback(null);
        }
        
        function loadCompleted(err, req, script) {
            if(checkErr(err, script)) { return; }
            
            ++loaded;
            injectScript(script, req.responseText);
            console.log('Loded script ' + script);
            if(loaded === running) {
                if(typeof initScript_src === 'string') {
                    allDone();
                }
            }
        }
        
        // load all the sources
        for(var i=0; i < scripts.length ;i++) {
            (function(){
                var script = scripts[i];
                request(script, function(err, req){
                    loadCompleted(err, req, script);
                });
                ++running;
            })();
        }
        
        // Then load the init script
        request(initScript, function(err, req){
            if(checkErr(err, initScript)) { return; }
            
            initScript_src = req.responseText;
            if(loaded === running) {
                allDone();
            }
        });
    }
    
    function pathConcat(p1, p2) {
        if(p1[p1.length-1] !== '/'){
            p1 = p1 + '/';
        }
        return p1 + p2;
    }

    function mapScriptRoot(root, scripts){
        function map(arr, fn) {
            var r = []; var l = arr.length;
            for(var i=0; i < l ;i++) {
                r.push(fn(arr[i]));
            }
            return r; 
        };
        
        return map(scripts, function(sc){ return pathConcat(root, sc); });
    }
    
    loadUnhosted = function loadUnhosted(root, callback){
        var scripts = ['jsbn.js', 'prng4.js', 'rijndael.js', 'rng.js', 'sha1.js'];
        scripts = mapScriptRoot(root, scripts);
        
        var loadOptions = {
            scripts: scripts
            , initScript: pathConcat(root, 'unhosted.js')
        };
        
        loadScripts(loadOptions, callback);
    }
})()
