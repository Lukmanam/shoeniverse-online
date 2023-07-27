const UserDB = require("../model/usermodel");
const bcrypt = require("bcrypt");
const dotenv=require("dotenv")
dotenv.config();

//LOAD DASHOARD
const loaddashboard = async(req,res)=>{
    try {
        
        res.render('index');

    } catch (error) {
        console.log(error.message);
    }
}

//LOADLOGIN///////////////////////////////////////
const loadLogin=async(req,res)=>{
try{
    res.render('adminlogin')

}
catch(error)
{
    console.log(error.message);
}
}

//VERIFYLOGIN///////////////////

const verifyLogin =  async(req,res)=>{
    try{
    const inputId=req.body.loginid;
    const password=req.body.password



if(inputId===process.env.ADMIN_USER)
{
    
    if(password!=process.env.ADMIN_PASS)
    {
        console.log("credentials not match");
        res.render('adminlogin',{message:"incorrect credentials"  
        })
    
    }
    else
    {
        res.redirect("/admin/dashboard");
    }
}

}
catch (error) {
    console.log(error.message);
  }
}



const loaduserlist = async (req, res) => {
    try {
      const usersData = await UserDB.find({ is_admin: 0 });
      res.render("userlist", { users: usersData });
    } catch (error) {
      console.log(error.message);
    }
  };

  const blockUser =async(req,res)=>{
    try {
        const { userId }=req.body;
        const blockUser=await UserDB.findById({_id: userId});
        if(blockUser.is_blocked==0)
        {
            await UserDB.findByIdAndUpdate(
                {_id: userId},{$set:{is_blocked:1}}
            );
            res.status(201).json({
                message:true,
            });
        }
        else
        {
            await UserDB.findByIdAndUpdate(
                {_id:userId},
                {$set:{is_blocked:0}}
                );
        }
        res.status(201).json({
            message:false})

    } catch (error) {
        console.log(error.message);
        
    }
  };



module.exports = {
    loaddashboard,
    loadLogin,
    verifyLogin,
    loaduserlist,
    loaddashboard,
    blockUser
}