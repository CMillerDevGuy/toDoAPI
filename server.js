var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var PORT = process.env.PORT || 8000;
var todos = [];
var toDoNextId = 1;

app.use(bodyParser.json());

app.get('/todos', function(req, res){
    var quesryParams = req.query;
    var filteredTodos = todos;
    if(quesryParams.hasOwnProperty('completed') && quesryParams.completed === 'true'){
        filteredTodos = _.where(filteredTodos, {completed:true})
    } else if (quesryParams.hasOwnProperty('completed') && quesryParams.completed === 'false'){
        filteredTodos = _.where(filteredTodos, {completed:false})
    }

    if(quesryParams.hasOwnProperty('q') && quesryParams.q.length > 0){
        var q = quesryParams.q.toLowerCase();
        filteredTodos = _.filter(filteredTodos, function(obj){
            return obj.description.toLocaleLowerCase().indexOf(q) > -1;
        })
    }

    res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    db.todo.findById(todoId).then(function(success){
        if(success){
            res.json(success.toJSON());
        }else{
            res.status(404).send('No Todo Found');
        }

    },function(err){
        res.status(500).send(err.errorMessage);
    })
});

app.post('/todos', function(req, res) {
    var body = req.body;
    db.todo.create(body).then(function(success){
        res.json(success.toJSON());
    }, function(err){
        res.status(404).json(err);
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

app.get('/', function(req, res){
    res.send('Todo API root');
});

db.sequelize.sync({force: true}).then(function(){
    app.listen(PORT, function(){
        console.log('Listening on port: ' + PORT);
    });
});


