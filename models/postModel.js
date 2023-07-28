const mongoose=require('mongoose')

const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    author:{
        type:String,
    },
    likedBy:[{
        type:String,
        // unique:true
    }]
},{
    timestamps:true
})

module.exports=mongoose.model('Post',postSchema)