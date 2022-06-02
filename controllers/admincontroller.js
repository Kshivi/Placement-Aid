const User=require("../models/userModel");
const bcrypt=require("bcrypt");
const randormstring=require("randomstring");
const config=require("../config/config");
const nodemailer=require("nodemailer");
const { default: mongoose } = require("mongoose");
const loadlogin=async(req,res)=>{
    try {
        res.render('adlogin');
    } catch (error) {
        console.log(error.message);
    }
}
const securePassword=async(password)=>{
    try{
         const passwordHash=await bcrypt.hash(password,10)
         return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}
const verifyLogin=async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userData=await User.findOne({email:email});
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_admin===0){
                    res.render('adlogin',{message:"You are not an Admin"});
                }else{
                    req.session.user_id=userData._id;
                    res.redirect('/admin/adhome');
                }
            }else{
                res.render('adlogin',{message:" password is incorrect"})
            }
        }else{
            res.render('adlogin',{message:"Email and password is incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const LoadDashboard=async(req,res)=>{
    try {
        const userData=await User.findById({_id:req.session.user_id});
        res.render('adhome',{admin:userData});
    } catch (error) {
        console.log(error.message);
    }
}
const logout=async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}
const forgetLoad=async(req,res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}//for resetsendmail
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
            html : '<h3>Dear '+name+'</h3><p>You have requested to Reset your password. To Reset your password Successfully, Follow the Link bellow to Reset it</p><p>Click <a href="http://127.0.0.1:8000/admin/forget-password?token='+token+'">Reset</a>  your password</p><p>Regards,</p><p>Placement Helping Aid</p>',
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
const forgetVerify= async(req,res)=>{
    try {
        const email=req.body.email;
        const userData=await User.findOne({email:email});
        if(userData){
            if(userData.is_admin===0){
                res.render('forget',{message:'Not a admin email'});
            }else{
                const randomString=randormstring.generate();
                const updatedData=await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:"Please check your mail to reset your password"});
            }
            
        }else{
            res.render('forget',{message:"Email is incorrect"})
        }
           
    } catch (error) {
        console.log(error.message);
    }
}
const forgetpasswordLoad=async(req,res)=>{
    try {
        const token=req.query.token;
        const tokenData=await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }else{
            res.render('404',{message:"Invalid Link"});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword=async(req,res)=>{
    try {
        const password=req.body.password;
        //const user_id=req.body.user_id;
        const secure_password= await securePassword(password);
        const updatedData=await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{password:secure_password,token:''}});
        res.redirect('/admin');
        //console.log("password changed");

    } catch (error) {
        console.log(error.message);
    }
}
const adminDashboard=async(req,res)=>{
    try {
        const userData=await User.find({is_admin:0});
        res.render('dashboard',{users:userData});
    } catch (error) {
        console.log(error.message);
    }
}
const newUserLoad=async(req,res)=>{
    try {
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
    }
}
//for send mail
const addUserMail=async(name,email,password,user_id)=>{
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
            subject : "Admin Add you verify your account",
            html : '<h3>Dear '+name+'</h3><p>You have requested to please verify your email, Follow the Link bellow to Reset it</p><p>Click <a href="http://localhost:8000/verify?id='+user_id+'">verify</a></p><p><b>Email:</b>'+email+'<br><br><b>Password: </b>'+password+'</p><p>Regards,</p><p>Placement Helping Aid</p>',
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

const addUser=async(req,res)=>{
    try {
        const name=req.body.name;
        const email=req.body.email;
        const mobile=req.body.mob;
        const image=req.file.filename;
        const password= randormstring.generate(4);
        const spassword=await securePassword(password);
        const user=new User({
            name:name,
            email:email,
            mobile:mobile,
            image:image,
            password:spassword,
            is_admin:0,
        });
        const userData=await user.save();
        if(userData){
            addUserMail(name,email,password,userData._id);
            res.redirect('/admin/dashboard');
        }else{
            res.render('new-user',{message:'Something Wrong'});
        }
            
    } catch (error) {
        console.log(error.message);
    }
}
const editUserLoad=async(req,res)=>{
    try {
        const id=req.query.id;
        const userData=await User.findById({_id:id});
        if(userData){
            res.render('edit-user',{user:userData});
        }else{
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error.message);
    }
}
const UpdateUserLoad=async(req,res)=>{
    try {
    const userData=await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mob,is_varified:req.body.verify}});
    res.redirect('/admin/dashboard');    
} catch (error) {
        console.log(error.message);
    }
}
const deleteUser=async(req,res)=>{
    try {
        const id=req.query.id;
        await User.deleteOne({_id:id});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    loadlogin,
    verifyLogin,
    LoadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetpasswordLoad,
    resetPassword,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    UpdateUserLoad,
    deleteUser
}