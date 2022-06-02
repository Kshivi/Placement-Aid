const mongoose=require("mongoose");
const validator=require("validator");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        minlength:[2,"minimum 2letters"],
        maxlength:45
    },
    email:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
    
    },
    mobile:{
        type:Number,
        required:true,
        unique: true,
        trim:true,
        minlength:[10,"Invalid number"],
        maxlength:10
    },
    image:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    is_admin:{
        type:Number,
        required:true,
    },
    is_varified:{
        type:Number,
        default:0,
    },
    token:{
        type:String,
        default:'',
    }

});
module.exports=mongoose.model('user',userSchema);