var express = require('express');
var app = express();
var PORT = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send('Todo API root');
})

app.listen(PORT, function(){
    console.log('Listening on port: ' + PORT);
});