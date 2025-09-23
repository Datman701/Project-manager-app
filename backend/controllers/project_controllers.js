import Project from '../models/project.js'
import User from '../models/user.js'

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

export const addMember = async (req , res) =>{
  const { userName } = req.body
  const projectId = req.params.projectId

  try{
    const user = await User.findOne({userName : userName})

    if(!user){
      return res.status(404).json({message : "User not found"})
    }

    const project = await Project.findById(projectId)

    if(!project){
      return res.status(404).json({message : "Project not found"})
    }

    // Authorization: only project creator can add members
    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Only project creator can add members" })
    }

    // Check if user is already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: "User is already a member of this project" })
    }

    // Add user to project members
    project.members.push(user._id)
    await project.save()

    // Add project to user's projects
    user.projects.push(projectId)
    await user.save()

    return res.status(200).json({
      message: "Member added successfully",
      project: project
    })

  }catch(err){
    console.log("error in adding member" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const getMembers = async (req, res) => {
  const projectId = req.params.projectId

  try {
    const project = await Project.findById(projectId).populate('members', 'name userName email')

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Authorization: only project members can view members
    const isCreator = project.createdBy.toString() === req.userId
    const isMember = project.members.some(member => member._id.toString() === req.userId)

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: "Not authorized to view project members" })
    }

    return res.status(200).json({
      message: "Members fetched successfully",
      members: project.members,
      totalMembers: project.members.length
    })

  } catch (err) {
    console.log("error in getting members", err)
    return res.status(500).json({ message: "internal server error" })
  }
}

export const deleteMember = async (req , res) =>{
  const { userName } = req.body
  const projectId = req.params.projectId

  try{
    const user = await User.findOne({userName : userName})

    if(!user){
      return res.status(404).json({message : "User not found"})
    }

    const project = await Project.findById(projectId)

    if(!project){
      return res.status(404).json({message : "Project not found"})
    }

    // Authorization: only project creator can delete members
    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Only project creator can remove members" })
    }

    // Check if user is a member
    if (!project.members.includes(user._id)) {
      return res.status(400).json({ message: "User is not a member of this project" })
    }

    // Prevent creator from removing themselves
    if (user._id.toString() === project.createdBy.toString()) {
      return res.status(400).json({ message: "Project creator cannot be removed from the project" })
    }

    // Remove user from project members (proper ObjectId comparison)
    project.members = project.members.filter(memberId => memberId.toString() !== user._id.toString())
    await project.save()

    // Remove project from user's projects array
    user.projects = user.projects.filter(projId => projId.toString() !== projectId.toString())
    await user.save()

    return res.status(200).json({
      message: "Member removed successfully",
      remainingMembers: project.members.length
    })



  }catch(err){
    console.log("could not delete user" , err)
    return res.status(500).json({message : "internal server error"})
  }


}