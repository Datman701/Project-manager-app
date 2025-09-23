import express from 'express'
import {createTask , getTasks , getTaskById , updateTask , deleteTask} from "../controllers/task_controllers.js"
import isAuth from "../middlewares/isAuth.js"

const taskRouter = express.Router()

taskRouter.post("/createtask/:projectId" ,isAuth, createTask)
taskRouter.get("/gettasks/:projectId" ,isAuth , getTasks)
taskRouter.get("/gettaskbyid/:taskId" ,isAuth ,  getTaskById)
taskRouter.patch("/updatetask/:taskId" ,isAuth ,  updateTask)
taskRouter.delete("/deleteTask/:taskId" ,isAuth ,  deleteTask)

export default taskRouter