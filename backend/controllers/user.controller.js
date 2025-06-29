import {User} from '../models/user.model.js';
import bcrypt from 'bcryptjs';// used for encrypting passwords
import jwt from 'jsonwebtoken';




export const register = async (req, res) => {
    try{
        const{username, email, password} = req.body;
        if(!username || !email || !password){
            return res.status(401).json({message: 'All fields are required something is missing',success: false});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({message: 'try different email ',success: false});
        }

        const hashedPassword = await bcrypt.hash(password, 10);// hashing the password with bcryptjs and 10 is the salt rounds
        // salt rounds are the number of times the password is hashed, more rounds means more security but also more time to hash
        await User.create({username, email, password:hashedPassword });
        return res.status(201).json({message: 'User created successfully',success: true});// 201 is the status code for created
    }
    catch(err){
console.log(err);
    }
}


export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(401).json({message: 'All fields are required something is missing please check ' ,success: false});
        }
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: 'Invalid email or password',success: false});
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({message: 'Invalid email or password',success: false});
        }

        
        const token = await jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: '1d'});// creating a token with userId and secret key and expires in 1 day , you dont need to login as long as the token is valid in the cookie
        
  // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }


        return res.cookie('token', token, {httpOnly: true,sameSite:'strict',maxAge:1*24*60*60*1000}).status(200).json({
            message: `Welcome back ${user.username}`,success: true , user });
    } 
    catch (error) {
        console.log(error);
    }
}; 

export const logout = async (_, res) => {
    try {
  return res.cookie("token","",{maxAge:0}).json({
    message: "Logged out successfully",success: true});
    } catch (error) {
        console.log(error);
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).select("-password");// selecting all fields except password
        return res.status(200).json({
            user,
            success: true,
        });
         } catch (error) {
        console.log(error);     
    }
};


export const editProfile = async (req, res) => {    
    try {
        const  userId = req.id;
        const{bio,gender} = req.body;
        const profilePicture = req.file;
        let cloudResponse ;
        if(profilePicture){
           const fileUri = getDataUri(profilePicture);
           cloudResponse =  await cloudinary.uploader.upload(fileUri);
        }

        const user  = await User.findByIdAndUpdate(userId);
        if(!user){
            return res.status(404).json({message: 'User not found',success: false});
        }
        if(bio) user.bio = bio ;
        if(gender) user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({message: 'Profile updated successfully',success: true, user}); 

    } catch (error) {
        console.log(error);
          }
}



export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUsers){
            return res.status(400).json({message: 'currently do not have any users '});

        };
        return res.status(200).json({success: true, users:suggestedUsers})
    } catch (error) {
        console.log(error); 
    }
};


export const followOrUnfollow = async (req, res) => {   
    try {
        const followKrneWala = req.id;  
        const jiskoFollowKrunga = req.params.id;   
        if(followKrneWala === jiskoFollowKrunga){
            return res.status(400).json({message: 'You cannot follow/unfollow yourself',success: false});
        }
        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);
        if(!user || !targetUser){
            return res.status(400).json({message: 'User not found',success: false});
        }
        // now will check follow krna h ya unfollow 
        const isFollowing = user.following.includes(jiskoFollowKrunga);
        if(isFollowing){
            // already followed h unfollow logic aaega 
            await Promise.all([
                User.updateOne({_id: followKrneWala},{ $pull: {following: jiskoFollowKrunga}}),
                User.updateOne({_id: jiskoFollowKrunga}, {$pull: {followers: followKrneWala}}),
            ])
            return res.status(200).json({message:'Unfollowed successfully',success: true}); 

        }
        else{
            await Promise.all([// promise.all is used to run multiple promises in parallel
                // if not following then follow logic aaega
                User.updateOne({_id: followKrneWala},{ $push: {following: jiskoFollowKrunga}}),
                User.updateOne({_id: jiskoFollowKrunga}, {$push: {followers: followKrneWala}}),
            ])
            return res.status(200).json({message:'Followed successfully',success: true});

        }

    } catch (error) {
        console.log(error);     
    }
};