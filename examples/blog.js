require(['unhosted', 'user', 'crypto', 'key-storage', 'unhosted!KeyValue'],
function(Unhosted, User, crypto, keyStorage, KeyValue){
    $('#example')
        .html('<div id="blogposts"></div>'
              + '<textarea id="blogpost" rows="5" cols="40">Hello World!</textarea>'
              + '<br /><input type="submit" value="Make me unhosted!" id="post" />');

    var server = null;
    var user = null;

    if(!localStorage.getItem('/unhosted/blogsessionKey')) {
        localStorage.setItem('/unhosted/blogsessionKey'
                             , crypto.random.bytes(16).join(''));
    }

    init();
    
    function init(){
        user = new User('me@example.com');
        user.password = '1234';
        user.keyID = keyID;
        user.getID(function(){
            server = new KeyValue(user, document.location.host);
            setup();
        });
    }
    
    function setup(){
        $('#post').click(function(){
            // Get the post count
            server.get('/AwesomeBlog/posts', function(err, data){
                if(err && err.number != 404) { error(err); return; }
                if(err && err.number == 404) { data = '{"value": "0"}'; }
                
                data = JSON.parse(data);
                var count = parseInt(data.value, 10);
                count = count >= 0 ? count : 0;
                
                var sessionKey = localStorage.getItem('/unhosted/blogsessionKey');
                var val = crypto.aes.encryptCBC($('#blogpost').val(), sessionKey);

                server.set('/AwesomeBlog/posts/' + count, val, function(err, data){
                    if(err) { error(err); return; }
                    
                    count++;
                    server.set('/AwesomeBlog/posts'
                               , count.toString()
                               , function(err, data)
                               {
                                   if(err) { error(err); return; }
                                   console.log('count updated');
                               });
                    console.log('post set');
                });
            });
        });
        
        checkPosts();
    }
    
    function checkPosts(){
        server.get('/AwesomeBlog/posts', fetchPosts);
    }
    
    function fetchPosts(err, data){
        if (err) { error(err); return; }
        try {
            console.log(data);
            var cmd = JSON.parse(data);
            var lastPost = cmd.value;
            
            var posts = [];
            var running = 0;
            for(var i=lastPost-1; i >= 0 ;i--) {
                running++;
                server.get('/AwesomeBlog/posts/' + i, function(err, data){
                    running--;
                    posts.push(data);
                    
                    if(running === 0) {
                        done(posts);
                    }
                });
            }
        } catch(e) {
            error(e);
        }

        function done(posts){
            var sessionKey = localStorage.getItem('/unhosted/blogsessionKey');
            console.log('done');
            console.log(posts);
            posts.forEach(function(post){
                $('#blogposts').append('<p>'
                 + crypto.aes.decryptCBC(JSON.parse(post).value, sessionKey)  +'</p>');
            });
        }
    }
    
    function error(err){
        if(err && err.number == 404) {
            $('#blogposts').html('<p>No blogposts found.</p>');
        } else {
            $('#blogposts').html('<p>ERROR: ' + err.message +'</p>');
            return;
        }
    }
});
