import { Response, Request } from 'express'
import { ITodo } from './../../types/todo'
import Todo from '../../models/todo'
import shortid from 'shortid';

const getTodos = async (req: Request, res: Response): Promise<void> => {
    try {
        const todos: ITodo[] = await Todo.find()
        res.status(200).json({ todos })
    } catch (error) {
        throw error
    }
}

const addTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as Pick<ITodo, 'name' | 'parentID' | 'description' | 'status' | 'timeCreated' | 'timeDue'>

        let tempID = shortid.generate()

        var listOfToDos =  new Array<ITodo>();

        listOfToDos.push(
            new Todo({
                name: body.name + " Due: " + MSToDate(calculateTimeDue(Date.now(), 1)),
                parentID: tempID,
                description: body.description,
                status: body.status,
                timeCreated: Date.now(),
                timeDue: calculateTimeDue(Date.now(), 1)
            }) 
        )

        listOfToDos.push(
            new Todo({
                name: body.name + " Due: " + MSToDate(calculateTimeDue(Date.now(), 2)),
                parentID: tempID,
                description: "[Second Revision] " + body.description,
                status: body.status,
                timeCreated: Date.now(),
                timeDue: calculateTimeDue(Date.now(), 2)
            }) 
        )

        listOfToDos.push(
            new Todo({
                name: body.name + " Due: " + MSToDate(calculateTimeDue(Date.now(), 3)),
                parentID: tempID,
                description: "[Final Revision] " + body.description,
                status: body.status,
                timeCreated: Date.now(),
                timeDue: calculateTimeDue(Date.now(), 3)
            }) 
        )

        listOfToDos.forEach((value) => {
            value.save()
        })

        const allTodos: ITodo[] = await Todo.find()

        res.status(201).json({ message: 'Todo added', todos: allTodos })
    } catch (error) {
        throw error
    }
}

const updateTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req
        const updateTodo: ITodo | null = await Todo.findByIdAndUpdate(
            { _id: id },
            body
        )
        const allTodos: ITodo[] = await Todo.find()
        res.status(200).json({
            message: 'Todo updated',
            todo: updateTodo,
            todos: allTodos,
        })
    } catch (error) {
        throw error
    }
}

const deleteTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedTodo: ITodo | null = await Todo.findByIdAndRemove(
            req.params.id
        )
        const allTodos: ITodo[] = await Todo.find()
        res.status(200).json({
            message: 'Todo deleted',
            todo: deletedTodo,
            todos:allTodos,
        })
    } catch (error) {
        throw error
    }
}

function getMSFromDays(Days : number){
    return (Days * 86400000)
}

function calculateTimeDue(Time: number, Revision: number){
    switch (Revision){
        case 1:
            return Time + getMSFromDays(1);
        case 2:
            return Time + getMSFromDays(3);
        case 3:
            return Time + getMSFromDays(6);
    }
    return -1;
}

function MSToDate(MS : number){
    var s = new Date(MS).toLocaleDateString("en-US")
    return s;
}

export { getTodos, addTodo, updateTodo, deleteTodo }
