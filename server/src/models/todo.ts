import { ITodo } from './../types/todo';
import { model, Schema } from 'mongoose'

const todoSchema: Schema = new Schema({
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

}, { timestamps: false })


export default model<ITodo>('Todo', todoSchema)