"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./router"));
const users_1 = require("./users");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: `${process.env.FRONTEND_URL}`
    }
});
io.on('connection', socket => {
    console.log("Conexão detectada...");
    socket.on('join', ({ name, room }, callback) => {
        console.log(name, room);
        const retorno = (0, users_1.addUser)({ id: socket.id, name, room });
        if (typeof retorno === 'string') {
            return callback({ error: retorno });
        }
        else {
            socket.emit('message', { user: 'admin', text: `${retorno.name}, welcome to room ${retorno.room}.` });
            socket.broadcast.to(retorno.room).emit('message', { user: 'admin', text: `${retorno.name} has joined!` });
            socket.join(retorno.room);
            io.to(retorno.room).emit('roomData', { room: retorno.room, users: (0, users_1.getUsersInRoom)(retorno.room) });
            callback();
        }
        // socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
        // socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
        // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        // callback();
    });
    socket.on('sendMessage', (message, callback) => {
        const user = (0, users_1.getUser)(socket.id);
        if (typeof user === 'undefined') {
            console.log('undefined');
        }
        else {
            io.to(user.room).emit('message', { user: user.name, text: message });
            callback();
        }
    });
    socket.on('disconnect', () => {
        console.log('User had left!!!');
        const user = (0, users_1.removeUser)(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: (0, users_1.getUsersInRoom)(user.room) });
        }
    });
});
app.use(router_1.default);
server.listen(3000, () => console.log('Server has started on port 3000.'));
