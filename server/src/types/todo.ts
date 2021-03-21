import { Document } from 'mongoose'

export interface ITodo extends Document {
    name: string
    parentID: string
    description: string
    status: boolean
    timeCreated: Number
    timeDue: Number
}