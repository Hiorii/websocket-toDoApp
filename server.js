const express = require('express');
const app = express();
var cors = require('cors')
const socket = require('socket.io');

const server = app.listen(process.env.PORT || 8000,()=> {
    console.log('Server connected');
});

app.use(cors());

const io = socket(server, {
    cors: {
        origin: '*',
    }
});
const tasks = [];

io.on('connection',(socket)=> {
    socket.emit('updateData', tasks);
    socket.on('addTask',(task)=> {
        tasks.push(task);
        socket.broadcast.emit('addTask',task);
    })
    socket.on('removeTask',(id)=> {
        tasks.splice(id,1);
        socket.broadcast.emit('removeTask', id);
    })
    socket.on('editTask',(task)=> {
        const editedItem = tasks.find(item=> item.id === task.id);
        const indexOfEditedItem = tasks.indexOf(editedItem);
        tasks[indexOfEditedItem].name = task.name;
        socket.broadcast.emit('updateData', tasks)
    })
});

app.use((req,res)=> {
   res.status(404).send({message: 'Not found...'}) ;
});