
import type { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from "@repo/db/client"
import { SignupSchema , loginSchema } from "@repo/common/types";



const JWT_SECRET = process.env.JWT_SECRET||"my-secret";

export const signupController = async (req:Request , res:Response , next :NextFunction)=>{
    try{
        const body = req.body;
        const {success} = SignupSchema.safeParse(body);

        if(!success){
            return res.status(400).json({
                success:false,
                message :"Invalid Credentials"
            });
        }

        const existingUser = await prisma.user.findUnique({
            where:{
                email : body.email
            }
        });

        if(existingUser){
            return res.status(400).json({
                success:false,
                message : "Email already registered"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(body.password , salt);

        const user = await prisma.user.create({
            data:{
                name:body.name,
                email:body.email,
                password : hashPassword
            },

            select:{
                id:true,
                name:true,
                email:true
            }
        });

        const token = jwt.sign({id : user.id} , JWT_SECRET);

        res.status(200).json({
            sucess:true,
            user,
            token
        });  
    }catch(err){
        next(err);
    }
    
    
}
export const loginController = async (req:Request , res:Response , next :NextFunction)=>{
    try{
        const body = req.body;

        const {success} = loginSchema.safeParse(body);

        if(!success){
            return res.status(400).json({
                success:false,
                message :"Invalid Credentials"
            });
        }

        const user = await prisma.user.findUnique({
            where:{
                email:body.email
            },
            select:{
                id :true,
                email:true,
                name :true,
                password:true
            }
        });

        if(!user){
            return res.status(400).json({
                success:false,
                message : "Email not registered"
            })
        }

        const valid = await bcrypt.compare(body.password , user.password);

        if(!valid){
            return res.status(400).json({
                success:false,
                message : "Entered wrong Password"
            })
        }

        const token = jwt.sign({id : user.id} , JWT_SECRET);

        return res.status(200).json({
            success:true,
            user,
            token
        });
    }catch(err){
        next(err);
    } 

}


export const logoutController = (req:Request , res:Response)=>{
    res.status(200).json({
        sucess:true,
        message:"Logged Out Successfully"
    })
}

export const getCurrentUser = async (req:Request , res:Response , next:NextFunction)=>{
    try{
        const user = await prisma.user.findUnique({
            where:{
                id : req.userId
            }
        });

        res.status(200).json({
            success:true,
            user
        });
    }catch(err){
        next(err);
    }
}