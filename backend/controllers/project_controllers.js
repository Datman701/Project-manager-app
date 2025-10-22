import Project from '../models/project.js'
import User from '../models/user.js'

export const createProject = async (req , res) =>{
  const { name, title, description, dueDate, deadline, status, priority } = req.body

  try{
    // Handle both 'name' and 'title' (frontend might use either)
    const projectTitle = name || title
    if(!projectTitle || !description){
      return res.status(400).json({message : "Project name and description are required"})
    }

    // Handle both 'deadline' and 'dueDate'
    const dateField = deadline || dueDate
    let dueDateValue = null

    if(dateField){
      const dueDateObj = new Date(dateField);
      if(isNaN(dueDateObj.getTime())){
        return res.status(400).json({message: "Invalid date format"})
      }
      // Allow future dates or no date
      dueDateValue = dateField
    }

    const newProject = await Project.create({
      title: projectTitle,
      description,
      createdBy: req.userId,
      members: [req.userId],
      dueDate: dueDateValue,
      status: status || 'active',
      priority: priority || 'medium'
    })

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
    .populate('createdBy', 'name email')
    .populate('members', 'name email')

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
      .populate('createdBy', 'name email')
      .populate('members', 'name email')

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    // Check if user is authorized to view this project
    const isCreator = project.createdBy._id.toString() === req.userId
    const isMember = project.members.some(member => member._id.toString() === req.userId)

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
    const { name, title, description, dueDate, deadline, status, priority } = req.body
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    if(req.userId !== project.createdBy._id.toString()){
      return res.status(403).json({message : "Not authorized to update this project!!"})
    }

    let updatedFields = {}

    // Handle both 'name' and 'title' (frontend uses 'name', model uses 'title')
    if(name) updatedFields.title = name
    if(title) updatedFields.title = title
    if(description) updatedFields.description = description
    if(status) updatedFields.status = status
    if(priority) updatedFields.priority = priority

    // Handle both 'deadline' and 'dueDate' (frontend uses 'deadline', model uses 'dueDate')
    const dateField = deadline || dueDate
    if(dateField){
      const dueDateObj = new Date(dateField)
      // Allow past dates for updates (user might want to update an overdue project)
      if(isNaN(dueDateObj.getTime())){
        return res.status(400).json({message : "Invalid date format"})
      }
      updatedFields.dueDate = dateField
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updatedFields,
      {new : true}
    ).populate('createdBy', 'name email')
     .populate('members', 'name email')

    return res.status(200).json({
      message : "Project updated successfully",
      project : updatedProject
    })

  }catch(err){
    console.log("Error updating project:", err)
    return res.status(500).json({message : "internal server error"  , error : err})
  }
}

export const deleteProject = async (req , res) =>{
  try{
    const projectId = req.params.projectId
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')

    if(!project){
      return res.status(404).json({message : "project not found"})
    }

    // Check if user is authorized to delete (only creator can delete)
    if(req.userId !== project.createdBy._id.toString()){
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
  const { email } = req.body
  const projectId = req.params.projectId

  try{
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }

    const user = await User.findOne({email : email.toLowerCase()})

    if(!user){
      return res.status(404).json({message : "User not found with this email address"})
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

    // Return populated project data
    const populatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({
      message: "Member added successfully",
      project: populatedProject
    })

  }catch(err){
    console.log("error in adding member" , err)
    return res.status(500).json({message : "internal server error"})
  }

}

export const getMembers = async (req, res) => {
  const projectId = req.params.projectId

  try {
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')

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
  const { userId } = req.body
  const projectId = req.params.projectId

  try{
    if (!userId) {
      return res.status(400).json({message : "User ID is required"})
    }

    const user = await User.findById(userId)

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