import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
export const Comment = mongoose.model('Comment', commentSchema);