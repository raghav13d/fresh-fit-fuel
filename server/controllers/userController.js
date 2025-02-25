import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

//Login user
const loginUser= async (req,res)=>{
    const {email,password}=req.body;
    try {
        
        const user=await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:"User does not exist"})
        }

        const isPassMatch=await bcrypt.compare(password,user.password)

        if(!isPassMatch){
            return res.json({success:false,message:"Invalid credentials"})
        }

        const token=createToken(user._id)
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}
//register user

const registerUser=async (req,res)=>{
    const {name,password,email}=req.body;
    try {
        //checking if user already exists
        const exist=await userModel.findOne({email});
        if(exist){
            return res.json({success:false,message:"User already exists"})
        }
        //validating email format and strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Invalid Email"})
        }

        if(password.length<8){
            return res.json({success:false,message:"Enter a strong password"})
        }

        //hashing user Password
        const salt= await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        //creating a new user
        const newUser=new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user= await newUser.save()
        const token=createToken(user._id)
        res.json({success:true,token});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {loginUser,registerUser};