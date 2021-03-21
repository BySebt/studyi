"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.addTodo = exports.getTodos = void 0;
const todo_1 = __importDefault(require("../../models/todo"));
const shortid_1 = __importDefault(require("shortid"));
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield todo_1.default.find();
        res.status(200).json({ todos });
    }
    catch (error) {
        throw error;
    }
});
exports.getTodos = getTodos;
const addTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        let tempID = shortid_1.default.generate();
        var listOfToDos = new Array();
        listOfToDos.push(new todo_1.default({
            name: body.name + " Due: " + MSToDate(calculateTimeDue(Date.now(), 1)),
            parentID: tempID,
            description: body.description,
            status: body.status,
            timeCreated: Date.now(),
            timeDue: calculateTimeDue(Date.now(), 1)
        }));
        listOfToDos.push(new todo_1.default({
            name: body.name + " Due: " + MSToDate(calculateTimeDue(Date.now(), 2)),
            parentID: tempID,
            description: "[Second Revision] " + body.description,
            status: body.status,
            timeCreated: Date.now(),
            timeDue: calculateTimeDue(Date.now(), 2)
        }));
        listOfToDos.push(new todo_1.default({
            name: body.name + " Due: " + MSToDate(calculateTimeDue(Date.now(), 3)),
            parentID: tempID,
            description: "[Final Revision] " + body.description,
            status: body.status,
            timeCreated: Date.now(),
            timeDue: calculateTimeDue(Date.now(), 3)
        }));
        listOfToDos.forEach((value) => {
            value.save();
        });
        const allTodos = yield todo_1.default.find();
        res.status(201).json({ message: 'Todo added', todos: allTodos });
    }
    catch (error) {
        throw error;
    }
});
exports.addTodo = addTodo;
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        const updateTodo = yield todo_1.default.findByIdAndUpdate({ _id: id }, body);
        const allTodos = yield todo_1.default.find();
        res.status(200).json({
            message: 'Todo updated',
            todo: updateTodo,
            todos: allTodos,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.updateTodo = updateTodo;
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedTodo = yield todo_1.default.findByIdAndRemove(req.params.id);
        const allTodos = yield todo_1.default.find();
        res.status(200).json({
            message: 'Todo deleted',
            todo: deletedTodo,
            todos: allTodos,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.deleteTodo = deleteTodo;
function getMSFromDays(Days) {
    return (Days * 86400000);
}
function calculateTimeDue(Time, Revision) {
    switch (Revision) {
        case 1:
            return Time + getMSFromDays(1);
        case 2:
            return Time + getMSFromDays(3);
        case 3:
            return Time + getMSFromDays(6);
    }
    return -1;
}
function MSToDate(MS) {
    var s = new Date(MS).toLocaleDateString("en-US");
    return s;
}
