const User=require("../models/userModel");
const bcrypt=require("bcrypt");
const config=require("../config/config");
const randormstring = require("randomstring");
const nodemailer=require("nodemailer");
//const emailValidator=require("email-validator");
//const emailValidator = require('email-deep-validator');

const securePassword=async(password)=>{
    try{
         const passwordHash=await bcrypt.hash(password,10)
         return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}
const sendVerifyMail=async(name,email,user_id)=>{
try {
     var transporter=nodemailer.createTransport({
         service: 'gmail',
         host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
         
        auth:{
        user: config.emailUser,
        pass: config.emailPassword
        }
    });
    var mailOptions={
        from:'placementaid12@gmail.com',
        to : email,
        subject : "Please verify your account",
        html : '<h3>Dear '+name+'</h3><p>You have requested to please verify your email, Follow the Link bellow to Reset it</p><p>Click <a href="http://localhost:8000/verify?id='+user_id+'">verify</a></p><p>Regards,</p><p>Placement Helping Aid</p>',
    };
    transporter.sendMail(mailOptions, function(error,info){
     if(error){
            console.log(error);

     }else{
            console.log("Email sent: " + info.response);
            res.end("sent")
         }
   });
 
} catch (error) {
    console.log(error.message);
 }
}

//for resetsendmail
const sendResetPasswordMail=async(name,email,token)=>{
    try {
         var transporter=nodemailer.createTransport({
             service: 'gmail',
             host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
             
            auth:{
            user: config.emailUser,
            pass: config.emailPassword
            }
        });
        var mailOptions={
            from:'placementaid12@gmail.com',
            to : email,
            subject : "For Reset Password",
            html : '<h3>Dear '+name+'</h3><p>You have requested to Reset your password. To Reset your password Successfully, Follow the Link bellow to Reset it</p><p>Click <a href="http://127.0.0.1:8000/forget-password?token='+token+'">Reset</a>  your password</p><p>Regards,</p><p>Placement Helping Aid</p>',
        };
        transporter.sendMail(mailOptions, function(error,info){
         if(error){
                console.log(error);
    
         }else{
                console.log("Email sent: " + info.response);
                res.end("sent")
             }
       });
     
    } catch (error) {
        console.log(error.message);
     }
}
const verifyMail=async(req,res)=>{
    try {
        const updateInfo=await User.updateOne({_id:req.query.id},{$set:{is_varified:1}});
        console.log(updateInfo);
        res.render("email-verified");
    } catch (error) {
        console.log(error.message)
    }
}
//login verification
const verifyLogin=async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userData=await User.findOne({email:email});
        if(userData){
           const passwordMatch=await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if (userData.is_varified==0) {
                    res.render('login',{message:"please verify your email"});
                } else {
                    req.session.user_id=userData._id;
                    res.redirect('/home');
                }
            }else{
                res.render('login',{message:"Email and Password is incorrect"});
            }
        }else{
            res.render('login',{message:"You are not a registered user! please register"})
        }
    } catch (error) {
        console.log(error.message);
      }
}
const loadHome=async(req,res)=>{
    try {
        const userData=await User.findById({_id:req.session.user_id});
        res.render('home',{user:userData});
    } catch (error) {
        console.log(error.message);
    }
}
const loadRegister=async(req,res)=>{
    try {
        res.render('registration');
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser=async(req,res)=>{
    try {
        let p = await User.findOne({ email: req.body.email });
        if (p) {
        res.render('registration',{message:" User Already Exist"});
        }
        const spassword=await securePassword(req.body.password);
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mob,
            image:req.file.filename,
            password:spassword,
            is_admin:req.body.admin,
        });
        const userData=await user.save();
        if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"You registered successfully please check your email account for email Verification"});
          }else{
            res.render('registration',{message:"Your registeration failed"});
          }
    } catch (error) {
        console.log(error.message);
    }
}
//login
const loginLoad=async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
//logout
const userLogout=async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}
//forget password
const forgetLoad=async(req,res)=>{
    try {
        
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerify=async(req,res)=>{
    try {
        const email=req.body.email;
        const userData=await User.findOne({email:email});
        if(userData){
           if(userData.is_varified==0){
               res.render('forget',{message:"please verify your email"})
           }else{
               const randomstring=randormstring.generate();
               const updateData=await User.updateOne({email:email},{$set:{token:randomstring}});
               sendResetPasswordMail(userData.name,userData.email,randomstring);
               res.render('forget',{message:"Please check your mail to reset your password"})
            }
        }else{
            res.render('forget',{message:"User email is incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }

}
const forgetPasswordLoad=async(req,res)=>{
    try {
        const token=req.query.token;
        const tokenData=await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }else{
            res.render('404',{message:"Token is invalid"});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword =async(req,res)=>{
    try {
        const password=req.body.password;
        const user_id=req.body.user_id;
        const secure_password= await securePassword(password);
        const udupatedData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
        res.redirect("/");
        console.log("password changed");
    } catch (error) {
        console.log(error.message);
        res.render('404',{message:"email is not exist"});
    }
}
/*for sent verification mail */
const verificationLoad=async(req,res)=>{
    try {
       res.render('verification');
    } catch (error) {
        console.log(error.message);
        res.end("error");
    }
}
const sentVerificationLink=async(req,res)=>{
    try {
       const email=req.body.email;
       const userData=await User.findOne({email:email});
       if(userData){
        sendVerifyMail(req.body.name,req.body.email,userData._id);
        res.render('verification',{message:"Reset verification mail sent your mail id Please Check "});
         
       }else{
           res.render('verification',{message:"The email is not exist"})
       }
    } catch (error) {
        console.log(error.message);
        res.end("error");
    }
}
module.exports={
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerificationLink
    
    
}