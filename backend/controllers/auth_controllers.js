import bcrypt from 'bcryptjs'
import genToken from '../config/token.js'
import User from '../models/user.js'

export const signUp = async (req , res) =>{
  const {name ,userName ,  email , password} = req.body;

  console.log(req.body);
  try{

    if(!name || !email || !password || !userName){
      return res.status(400).json({message : 'all the fields are required!!'})
    }

    const existingEmail = await User.findOne({email})

    if(existingEmail){
      return res.status(400).json({message : "this email is already in use"})
    }

    const existinguserName = await User.findOne({userName})

    if(existinguserName){
      return res.status(400).json({message : "this useranme is already in use"})
    }

    if(password.length <=6){
      return res.status(400).json({message : "the password must be strictly greater than 6 characters"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password , salt)
    console.log(salt)

    const newUser = await User.create({name , userName , email , password : hashedPassword , projects : []})


    const token = await genToken(newUser._id)

    res.cookie('token' , token , {
      httpOnly : true,
      secure : false,
      sameSite :'lax',
      maxAge: 1000*60*60*24
    })

    res.status(200).json(newUser)
  }
    catch(err){
      res.status(500).json({message: "Ineternal server error"});
      console.log(err)
    }

  }

  export const signIn = async (req , res) =>{
    const {userName , password} = req.body

    try{
    if(!userName || !password){
      return res.status(400).json({message : "Please fill in all the required fields"})
    }

    const user = await User.findOne({userName : userName})

    if(!user){
      return res.status(400).json({message : "this username is not registered"})
    }

    const password_match = await bcrypt.compare(password , user.password)

    if(!password_match){
      return res.status(400).json({message : "password is incorrect, please try again"})
    }

    const token = await genToken(user._id)

    res.cookie('token' , token , {
      httpOnly : true,
      secure : false,
      sameSite :'lax',
      maxAge: 1000*60*60*24
    })

    res.status(200).json(user)
  }
  catch(err){
    res.status(500).json({message: "Internal server error"})
    console.log(err)
  }

}

export const getMe  = async () =>{
  try{
  const user = await User.findById({_id : req.userId})
  if(!user){
    return res.status(400).json({message : 'User not found'})
  }
  return res.status(200).json({user})
  }catch(err){
    return res.status(500).json({message : 'Internal server error'})
  }
}
