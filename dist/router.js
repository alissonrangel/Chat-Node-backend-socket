"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = require("./users");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('server is up and runner.');
});
router.get('/rooms', (req, res) => {
    res.json({ rooms: (0, users_1.getRooms)() });
});
exports.default = router;
