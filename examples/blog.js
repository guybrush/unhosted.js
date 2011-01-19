require(['unhosted'
         , 'user'
         , 'crypto'
         , 'key-storage'
         , 'util'
         , 'unhosted!KeyValue'],
function(Unhosted, createUser, crypto, keyStorage, util, KeyValue){
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

    (function init(){
        user = createUser('me@example.com');
        user.keyID = UnhostedExamples.publisherKeyID;
        user.getID(function(){
            user.servers = {
                'KeyValue-0.2': {
                    server: 'localhost:1337'
                    , 'user': user.id
                    , 'password': '1234'
                }
            };

            server = KeyValue.create(user);
            // TODO: get address from user login
            server.address = document.location.host;
            setup();
        });
    })();

    function setup(){
        $('#post').click(function(){
            $('#post').attr('disabled', true);

            // Get the post count
            server.get('/AwesomeBlog/posts', function(err, value){
                if(err && err.number != 404) { error(err); return; }
                if(err && err.number == 404) { value = '0'; }

                var count = parseInt(value, 10);
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
                               });

                    setTimeout(function(){
                        checkPosts();
                    }, 10);
                });
            });
        });

        checkPosts();
    }

    function checkPosts(){
        server.get('/AwesomeBlog/posts', fetchPosts);
    }

    function fetchPosts(err, value){
        if (err) { error(err); return; }
        try {
            var lastPost = parseInt(value, 10);

            var posts = [];
            var running = 0;
            for(var i=lastPost-1; i >= 0 ;i--) {
                running++;
                (function(i){
                    server.get('/AwesomeBlog/posts/' + i, function(err, post){
                        running--;
                        posts[i] = post;

                        if(running === 0) {
                            done(posts);
                        }
                    });
                })(i);
            }
        } catch(e) {
            error(e);
        }

        // Re-enable the post button _after_ doing the synchronous
        // decryption. Otherwise click events will queue up an trigger a some
        // more post actions when the browser returns to the event loop
        $('#post').attr('disabled', false);

        function done(posts){
            $('#blogposts').html('');
            var sessionKey = localStorage.getItem('/unhosted/blogsessionKey');
            posts.forEach(function(post, i){
                var p = crypto.aes.decryptCBC(post, sessionKey);
                $('#blogposts').append('<p>'+ i +'| '+ p +'</p>');
            });
        }
    }

    function error(err){
        if(err && err.number == 404) {
            $('#blogposts').html('<p>No blogposts found.</p>');
        } else {
            $('#blogposts').html('<p>ERROR: ' + err.message +'</p>');
            var stack = err.stack || err.stacktrace;
            console.log(stack);
            throw err;
            return;
        }
    }
});
