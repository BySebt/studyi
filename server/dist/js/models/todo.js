"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const todoSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    parentID: {
        type: String,
        required: false
    },
    //Replace with reference to file / image / etc
    description: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        required: true
    },
    timeCreated: {
        type: Number,
        required: true
    },
    timeDue: {
        type: Number,
        required: true
    }
}, { timestamps: false });
exports.default = mongoose_1.model('Todo', todoSchema);
