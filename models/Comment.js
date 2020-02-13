const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    _articleId: {
        type: Schema.Types.ObjectId,
        ref: "Article"
    },
    date: {
        type: Date,
        default: Date.now
    },
    comment : {
        type: String,
        required: true
    }
})

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;