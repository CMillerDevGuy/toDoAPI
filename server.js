var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var _ = require('underscore');
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
    }, function(err){
        res.status(404).send(err.errorMessage);
    });
});

app.delete('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo){
        res.status(404).send("No matched todo with that id");
    }else{
        todos = _.without(todos, matchedTodo);
        res.status(200).send(matchedTodo);
    }

});

app.put('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    var body = req.body;
    updateTodo(body, todoId).then(function(success){
        res.json(success);
    }, function(err){
        res.status(500).send(err.errorMessage);
    });
})

function updateTodo(todo, id){
    return new Promise(function(resolve, reject){
        var newTodo = _.pick(todo, 'completed', 'description');
        var matchedTodo = _.findWhere(todos, {id: id});
        var validAttributes = {};

        if(!matchedTodo){
            reject({errorMessage: 'No todo with id' + id});
        }

        if(newTodo.hasOwnProperty('completed') && _.isBoolean(todo.completed)){
            validAttributes.completed = todo.completed;
        } else if (newTodo.hasOwnProperty('completed')){
            reject({errorMessage: 'Completed is not a boolean'});
        }

        if(newTodo.hasOwnProperty('description') && _.isString(todo.description) && newTodo.description.trim().length > 0){
            validAttributes.description = todo.description;
        } else if (newTodo.hasOwnProperty('description')){
            reject({errorMessage: 'Description is not a string'});
        }
        resolve(_.extend(matchedTodo, validAttributes));

    })
}


function addTodo(todo){
    return new Promise(function(resolve, reject){
        if(!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0){
            reject({
                errorMessage: 'Invalid Todo'
            })
        }else{
            var newTodo = _.pick(todo, 'completed', 'description');
            newTodo.description = todo.description.trim();
            newTodo.id = toDoNextId;
            todos.push(newTodo);
            toDoNextId++;
            resolve(newTodo);
        }

    })
}

function searchTodosById(toDoId){
    return new Promise(function(resolve, reject){
        var id = parseInt(toDoId);
        var matchedTodo = _.findWhere(todos, {id: id});
        if(matchedTodo){
            resolve(matchedTodo);
        } else{
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