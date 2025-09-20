import express from 'express'
import {createProject , getProjects , getProjectById , updateProject , deleteProject} from '../controllers/project_controllers.js'
import isAuth from '../middlewares/isAuth.js'

const projectRouter = express.Router()

projectRouter.post('/createproject' ,isAuth , createProject )
projectRouter.get('/getprojects' ,isAuth ,  getProjects )
projectRouter.get('/getproject/:projectId' ,isAuth , getProjectById )
projectRouter.patch('/updateproject/:projectId' ,isAuth , updateProject)
projectRouter.delete('/deleteproject/:projectId' , isAuth , deleteProject)

export default projectRouter