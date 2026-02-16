import mongoose, { Schema } from 'mongoose'

const subTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        typr: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    createdBy: {
        typr: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export const SubTask = mongoose.model("SubTask", subTaskSchema)