var express = require('express');
var app = express();
var PORT = process.env.PORT || 8000;
var todos = [{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false
},
{
    id: 2,
    description: 'Go to market',
    completed: false
}];

app.get('/todos', function(req, res){
    res.json(todos);
});

app.get('/todos/:id', function(req, res){
    var id = req.params.id;
    searchTodosById(id).then(function(success){
        res.json(success);
    },function(err){
        res.status(404).send(err.errorMessage);
    })
})

function searchTodosById(toDoId){
    return new Promise(function(resolve, reject){
        var found = false;
        var id = parseInt(toDoId);
        for(var i = 0; i < todos.length; i++){
            if(todos[i].id == id){
                found = true;
                resolve(todos[i]);
            }
        }
        if(!found){
            reject({
                errorMessage: "No Todo with such id"
            })
        }
    })
}

app.get('/', function(req, res){
    res.send('Todo API root');
});

app.listen(PORT, function(){
    console.log('Listening on port: ' + PORT);
});