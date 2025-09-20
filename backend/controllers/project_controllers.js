import Project from '../models/project.js'

export const createProject = async (req , res) =>{
  const {title , description ,  dueDate} = req.body

  try{
    if(!title || !description || !dueDate){
      return res.status(400).json({message : "All the fields are required"})
    }

    const dueDateObj = new Date(dueDate);
    if (dueDateObj <= new Date()) {
      return res.status(400).json({message: "Due date must be in the future"})
    }

    const newProject = await Project.create({title , description  , createdBy : req.userId , members  : [req.userId] , dueDate })

    return res.status(201).json({
      message : "Project Created Successfully",
      project : newProject
    })

  }catch(err){
    console.log("error in making project" , err)
    return res.status(500).json({message : "Internal server error"})
  }
}

export const getProjects = async (req , res)  =>{
  try{
    const projects = await Project.find({
      $or : [
        {createdBy : req.userId},
        {members : {$in : [req.userId]}}
      ]
    })

    return res.status(200).json({
      message : "Projects fetched successfully",
      projects : projects
    })

  }catch(err){
    return res.status(500).json({message : "internal server error" , error : err})
  }
}

export const getProjectById = async (req , res) =>{
  try{
    const project = await Project.findById(req.params.projectId)

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    // Check if user is authorized to view this project
    const isCreator = project.createdBy.toString() === req.userId
    const isMember = project.members.some(member => member.toString() === req.userId)

    if(!isCreator && !isMember){
      return res.status(403).json({message : "Not authorized to view this project"})
    }

    return res.status(200).json({
      message : "successfully found project" ,
      project : project
    })

  }catch(err){
    return res.status(500).json({message : "internal server error" , error : err})
  }
}

export const updateProject = async (req , res) =>{
  try{
    const projectId = req.params.projectId
    const {title  , description  , dueDate} = req.body
    const project = await Project.findById(projectId)

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    if(req.userId !== project.createdBy.toString()){
      return res.status(403).json({message : "Not authorized to update this project!!"})
    }

    let updatedFields = {}

    if(title) updatedFields.title  = title
    if(description) updatedFields.description =  description

    if(dueDate){
      const dueDateObj = new Date(dueDate)

      if(dueDateObj <= new Date()){
        return res.status(400).json({message : "invalid date , the date must be in the future"})
      }
      updatedFields.dueDate = dueDate
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updatedFields,
      {new : true}
    )

    return res.status(200).json({
      message : "Project updated successfully",
      project : updatedProject
    })

  }catch(err){
    return res.status(500).json({message : "internal server error"  , error : err})
  }
}

export const deleteProject = async (req , res) =>{
  try{
    const projectId = req.params.projectId
    const project = await Project.findById(projectId)

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    // Check if user is authorized to delete (only creator can delete)
    if(req.userId !== project.createdBy.toString()){
      return res.status(403).json({message : "Not authorized to delete this project"})
    }

    const deletedProject = await Project.findByIdAndDelete(projectId)

    return res.status(200).json({
      message : "Project deleted successfully" ,
      deletedProject : deletedProject
    })

  }catch(err){
    return res.status(500).json({message : "internal server error"  , error : err})
  }
}