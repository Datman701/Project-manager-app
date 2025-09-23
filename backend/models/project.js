import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  title : {
    type : String,
    required : true
  } ,
  description : {
    type : String,
    required : true
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",

  },
  members : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  }],

  tasks : [{
    type : mongoose.Schema.Types.ObjectId,
    ref :"Task"
  }],
  status : {
    type : String,
    enum : ["active" , "completed" , "on-hold"],
    default : "active"

  },
  dueDate : {
    type : Date,
    required : true
  },
  createdAt : {
    type : Date,
    default : Date.now
  }
})

const Project = mongoose.model("Project" , projectSchema)

export default Project

