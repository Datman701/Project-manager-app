import Task from "../models/task.js"
import Project from "../models/project.js"
import User from "../models/user.js"

export const createTask = async (req , res) =>{
  const {title , description , status , priority , dueDate ,assignedTo} = req.body
  const projectId = req.params.projectId
  try{
    if(!title || !description || !priority || !projectId || !dueDate){
      return res.status(400).json({message : "Title, description, priority, project, and due date are required!"})
    }

    const project = await Project.findById(projectId)

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }

    // Validate dueDate (now required)
    const dueDateObj = new Date(dueDate);
    const now = new Date();
    const projectDueDate = new Date(project.dueDate);

    if (dueDateObj <= now) {
      return res.status(400).json({message: "Task due date must be in the future"})
    }

    if (dueDateObj > projectDueDate) {
      return res.status(400).json({message: "Task due date cannot be later than project due date"})
    }

    const taskData = {
      title,
      description,
      status: status || 'todo',
      priority,
      dueDate,
      projectId,
      assignedTo: assignedTo || req.userId,
      createdBy: req.userId
    };

    const newTask = await Task.create(taskData)

    // Add the new task ID to the project's tasks array
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { tasks: newTask._id } },
      { new: true }
    )

    // Populate the task with project and assignee info
    const populatedTask = await Task.findById(newTask._id)
      .populate('projectId', 'title name createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask
    })


  }catch(err){
    console.log("error in creating task" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

// Get all tasks for the authenticated user (across all projects)
export const getAllTasks = async (req, res) => {
  try {
    // Find all projects where user is creator or member
    const userProjects = await Project.find({
      $or: [
        { createdBy: req.userId },
        { members: req.userId }
      ]
    });

    const projectIds = userProjects.map(project => project._id);

    // Get all tasks from these projects
    const tasks = await Task.find({
      projectId: { $in: projectIds }
    })
    .populate('projectId', 'title name createdBy')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    return res.status(200).json(tasks);

  } catch (err) {
    console.log("error in getting all tasks", err);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getTasks = async (req , res) =>{
  const projectId = req.params.projectId
  try{
    const project = await Project.findById(projectId)
    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    // Check if user has access to this project
    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }

    // Get all tasks for this project with populated data
    const tasks = await Task.find({ projectId: projectId })
      .populate('projectId', 'title name createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);

  }catch(err){
    console.log("error in getting tasks" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const getTaskById = async (req , res) =>{
  const taskId = req.params.taskId

  try{
    const task = await Task.findById(taskId)
      .populate('projectId', 'title name createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if(!task){
      return res.status(404).json({message : "task could not be found"})
    }

    // Check if user has access to this task
    const project = await Project.findById(task.projectId._id);
    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized to view this task" });
    }

    return res.status(200).json(task)

  }catch(err){
    console.log("error in getting task by id" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const updateTask = async (req , res) =>{
  const taskId = req.params.taskId
  const {title , description , status , priority , dueDate ,assignedTo} = req.body

  console.log('Update task request received:', {
    taskId,
    body: req.body,
    userId: req.userId
  });

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
      const projectDueDate = new Date(project.dueDate);

      if(dueDateObj <= new Date()){
        return res.status(400).json({message : "Task due date must be in the future"})
      }

      if(dueDateObj > projectDueDate){
        return res.status(400).json({message : "Task due date cannot be later than project due date"})
      }

      updatedFields.dueDate = dueDate
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updatedFields,
      {new : true}
    )
    .populate('projectId', 'title name createdBy')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    return res.status(200).json(updatedTask)

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