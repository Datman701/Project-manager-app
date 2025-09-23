import Task from "../models/task.js"
import Project from "../models/project.js"
import User from "../models/user.js"

export const createTask = async (req , res) =>{
  const {title , description , status , priority , dueDate ,assignedTo} = req.body
  const projectId = req.params.projectId
  try{
    if(!title || !description || !status || !priority || !dueDate || !projectId || !assignedTo){
      return res.status(400).json({message : "All the fields are required!!"})
    }

    const project = await Project.findById(projectId)

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }

    const dueDateObj = new Date(dueDate);
    if (dueDateObj <= new Date()) {
      return res.status(400).json({message: "Due date must be in the future"})
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
      createdBy: req.userId
    })

    // Add the new task ID to the project's tasks array
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { tasks: newTask._id } },
      { new: true }
    )

    return res.status(201).json({
      message: "Task created successfully",
      task: newTask
    })


  }catch(err){
    console.log("error in creating task" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const getTasks = async (req , res) =>{
  const projectId = req.params.projectId
  try{
    const project = await Project.findById(projectId)
    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    // Get all tasks for this project
    const tasks = await Task.find({ projectId: projectId })

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks: tasks
    })

  }catch(err){
    console.log("error in getting tasks" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const getTaskById = async (req , res) =>{
  const taskId = req.params.taskId

  try{
    const task = await Task.findById(taskId)
    if(!task){
      return res.status(404).json({message : "task could not be found"})
    }
    return res.status(200).json({
      message : "Task found successfully",
      task : task
    })

  }catch(err){
    console.log("error in getting task by id" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const updateTask = async (req , res) =>{
  const taskId = req.params.taskId
  const {title , description , status , priority , dueDate ,assignedTo} = req.body
  try{
    const task = await Task.findById(taskId)
    if(!task){
      return res.status(404).json({message : "task not found"})
    }

    const project = await Project.findById(task.projectId)

    // Check if user is task creator OR project creator
    if(req.userId !== task.createdBy.toString() && req.userId !== project.createdBy.toString()){
      return res.status(403).json({message : "you are not authorized to edit this task"})
    }

    let updatedFields = {}

    if(title) updatedFields.title = title
    if(description) updatedFields.description = description
    if(status) updatedFields.status = status
    if(priority) updatedFields.priority = priority
    if(assignedTo) updatedFields.assignedTo = assignedTo
    if(dueDate){
      const dueDateObj = new Date(dueDate)

      if(dueDateObj <= new Date()){
        return res.status(400).json({message : "invalid date , the date must be in the future"})
      }
      updatedFields.dueDate = dueDate
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updatedFields,
      {new : true}
    )

    return res.status(200).json({
      message : "task updated successfully",
      task : updatedTask
    })

  }catch(err){
    console.log("error in updating task" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const deleteTask = async (req , res) =>{
  const taskId = req.params.taskId

  try{
    const task = await Task.findById(taskId)
    if(!task){
      return res.status(404).json({message : "task not found"})
    }

    const project = await Project.findById(task.projectId)

    // Check if user is task creator OR project creator
    if(req.userId !== task.createdBy.toString() && req.userId !== project.createdBy.toString()){
      return res.status(403).json({message : "you are not authorized to delete this task"})
    }

    // Remove task from database
    const deletedTask = await Task.findByIdAndDelete(taskId)

    // Remove task ID from project's tasks array
    await Project.findByIdAndUpdate(
      task.projectId,
      { $pull: { tasks: taskId } },
      { new: true }
    )

    return res.status(200).json({
      message : "task deleted successfully",
      deletedTask : deletedTask
    })

  }catch(err){
    console.log("error in deleting task" , err)
    return res.status(500).json({message : "internal server error"})
  }
}