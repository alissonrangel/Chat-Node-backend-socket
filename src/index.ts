import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from "socket.io";
import router from './router';
import { addUser, removeUser, getUser, getUsersInRoom , User} from './users'
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
  cors: {
    origin: `${process.env.FRONTEND_URL}`
  }
});

io.on('connection', socket => {
  console.log("Conexão detectada...");
  
  socket.on('join', ({ name, room }, callback) => {
    
    console.log(name, room);
    
    const retorno: string | User = addUser({ id: socket.id, name, room });    

    if( typeof retorno === 'string') {
      return callback({error: retorno})
    } else {
      socket.emit('message', { user: 'admin', text: `${retorno.name}, welcome to room ${retorno.room}.`});
      
      socket.broadcast.to(retorno.room).emit('message', { user: 'admin', text: `${retorno.name} has joined!` });
      
      socket.join(retorno.room);

      io.to(retorno.room).emit('roomData', { room: retorno.room, users: getUsersInRoom(retorno.room) });

      callback();
    }
    

    // socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    // socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    // callback();
  });

  socket.on('sendMessage', (message, callback) => {
    
    const user: User | undefined = getUser(socket.id);

    if ( typeof user === 'undefined' ) {
      console.log('undefined');      
    } else {
      io.to(user.room).emit('message', { user: user.name, text: message });
      callback();
    }  
  });

  socket.on('disconnect', () => {
    console.log('User had left!!!');  
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    } 
  })
});

app.use(router);

server.listen(3000, () => console.log('Server has started on port 3000.'));