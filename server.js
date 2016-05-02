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
    var query = req.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true'){
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false'){
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0){
        where.description = {
            $like : '%' + query.q + '%'
        }
    }

    db.todo.findAll({where:where}).then(function(todos){
        if(todos){
            
            res.json(todos)
        } else{
            res.status(404).send('No Todos Found');
        }
    }, function(err){
        res.status(500).json(err);
    })

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

    db.todo.destroy({where:{id: todoId}}).then(function(todo){
        if(todo){
            res.status(204).send();
        }else{
            res.status(404).send('No Todo Found')
        }
    }, function(err){
        res.status(500).send();
    })

});

app.put('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id);
    var body = req.body;
    var attributes = {};

    if(body.hasOwnProperty('completed')){
        attributes.completed = body.completed;
    }
    if(body.hasOwnProperty('description')){
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function(todo){
        if(todo){
            return todo.update(attributes);
        }else{
            res.status(404).send('No Todo Found');
        }
    }).then(function(todo){
        res.json(todo.toJSON());
    }).catch(function(err){
       res.status(500).json(err);
    });
});

app.get('/', function(req, res){
    res.send('Todo API root');
});

db.sequelize.sync().then(function(){
    app.listen(PORT, function(){
        console.log('Listening on port: ' + PORT);
    });
});


