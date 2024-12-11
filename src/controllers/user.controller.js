import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccess = async(userId)=> 
{
    try {
        const user = await User.findById(userId)
        console.log(user);
        

        const accessToken = user.generateAccessToken()

        user.accessToken = accessToken // user add to refreshToken 
        await user.save({ validateBeforeSave : false}) // user save RefreshToken

        return{accessToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while genrating access token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{

    const {fullName, email, password, role} = req.body

    if(
        [fullName, email, password].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const exitUser = await User.findOne({ email })
    if(exitUser) {
       return res
       .status(400)
       .json({message: 'User alredy exists'})
    }

    const user = await User.create({
        fullName,
        email,
        password,
        role
    })

    return res 
    .status(201)
    .json(
        new ApiResponse(200, user, "User registed successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    const user = await User.findOne({email})

    if(!user) {
        return res.status(401).json({ message: 'Invalid email or password'})
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if(!isPasswordvalid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken} = await generateAccess(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -accessToken")

    try{
        const options = {
            httpOnly: true,
            secure: false
        }

        return res
        .cookie("accessToken", accessToken, options )
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken
                },
                "User logged In Successfully"
            )
        )
    }catch(err) {
        console.log(err);
    }
})

const updateUser = asyncHandler(async(req, res) => {

    const userId = req.params.userId;

    const { fullName, email, role} = req.body;

    // Ensures that only users with the Admin role or 
    // the user trying to update their own profile (req.user._id === userId) can perform the operation.

    if(req.user.role !== 'Admin' && req.user._id !== userId){
        return res.status(403).json({message: 'You are not aunthorized to update this user'})
    }

    const updateUser = await User.findByIdAndUpdate(
        userId,
        {
            fullName,
            email,
            role
        },
        {
            new: true
        }
    )

    return res
    .status(201)
    .json(
        {message: 'User updated successfully', updateUser}
    )
})

const deleteUser = asyncHandler(async (req,res) => {
    const userId = req.params.userId;

    // console.log(req.user);
    

    if(req.user.role !== 'Admin') {
        return res.status(403).json({message: 'You are not authorized to delete User' })
    }

    await User.findByIdAndDelete(userId)
    {
        return res.status(200).json({ message: 'user deleted successfully' });
    }
})

const updateOwnprofile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
 
    // Log the IDs for debugging purposes
    // console.log("User ID from request:", req.user?._id);
    // console.log("User ID from URL:", req.params.userId);
 
    // Convert ObjectId to string for comparison
    const userIdFromRequest = req.user?._id.toString();
    const userIdFromUrl = req.params.userId;
 
    // Check if the user is updating their own profile
    if (userIdFromRequest !== userIdFromUrl) {
       throw new ApiError(403, 'You can only update your own profile');
    }
 
    // Ensure the required fields are provided
    if (!fullName || !email) {
       throw new ApiError(400, "All fields are required");
    }
 
    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(
       req.user?._id,
       {
          $set: {
             fullName,
             email
          }
       },
       { new: true }
    ).select("-password"); // Exclude the password field
 
    // Return a structured response
    return res
       .status(200)
       .json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
 });
 
 
 

export {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    updateOwnprofile
}