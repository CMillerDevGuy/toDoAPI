var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 8000;
var todos = [];
var toDoNextId = 1;

app.use(bodyParser.json());

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
});

app.post('/todos', function(req, res) {
    var body = req.body;
    addTodo(body).then(function(success){
        res.json(success);
    });
});


function addTodo(todo){
    return new Promise(function(resolve, reject){
        todo.id = toDoNextId;
        todos.push(todo);
        toDoNextId++;
        resolve(todo);
    })
}

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