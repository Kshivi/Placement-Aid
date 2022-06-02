const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Helping_aid", {useNewUrlParser: true});
const express=require("express");
const app=express();
//for user routes
const userRoute=require('./routes/userRoute');
app.use('/',userRoute);
//for admin panel
const adminRoute=require('./routes/adminRoute');
app.use('/admin',adminRoute);
//senior experience
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(require("./routes/index"))
app.use(require("./routes/compose"))
app.use(require("./routes/blog"))
app.listen(8000,function(){
    console.log("server is running");
});