const UserDB = require("../model/usermodel");
const categoryDB = require("../model/categorymodel");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");
const { log } = require("console");
dotenv.config();

//LOAD DASHOARD////////////////////////////////////
const loaddashboard = async (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.log(error.message);
  }
};

//LOADLOGIN///////////////////////////////////////
const loadLogin = async (req, res) => {
  try {
    let { message } = req.session;
    if (req.session.adminSession) {
      res.locals.session = req.session.adminSession;

      res.redirect("/admin/dashboard");
    } else {
      req.session.message = "";
      res.render("adminlogin", { message });
    }
  } catch (error) {
    res.redirect("/error500");
  }
};

//VERIFYLOGIN//////////////////////////////////

const verifyLogin = async (req, res) => {
  try {
    const inputId = req.body.loginid;
    const password = req.body.password;

    if (inputId === process.env.ADMIN_USER) {
      if (password != process.env.ADMIN_PASS) {
        console.log("credentials not match");
        res.render("adminlogin", { message: "incorrect credentials" });
      } else {
        req.session.admin_id = process.env.ADMIN_USER;
    console.log(req.session.admin_id, ":This is ADMIN SESSION");
        res.redirect("/admin/dashboard");
      }
    }
  } catch (err) {
    console.log("Error in Sign in",err);
    res.render("adminlogin",{message:"An error Occured in sign in"})
  }
};

 const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

// USERS LIST////////////////////////////////////////////
const loaduserlist = async (req, res) => {
  try {
    const usersData = await UserDB.find({ is_admin: 0 });
    res.render("userlist", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};
// const loadUsersList = async (req, res) => {
//   try {
//     const admin = req.session.admin_id;
//     let { search, status, page, itemsPerPage } = req.query;
//     page = parseInt(page) || 1;
//     itemsPerPage = parseInt(itemsPerPage) || ITEMS_PER_PAGE;

//     const query = {};

//     if (search) {
//       query.$or = [
//         { name: { $regex: new RegExp(search, 'i') } },
//         { email: { $regex: new RegExp(search, 'i') } },
//       ];
//     }

//     if (status) {
//       if (status === 'active') {
//         query.is_blocked = false;
//       } else if (status === 'blocked') {
//         query.is_blocked = true;
//       }
//     }

//     const totalUsers = await User.countDocuments(query);
//     const totalPages = Math.ceil(totalUsers / itemsPerPage);

//     const users = await User.find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * itemsPerPage)
//       .limit(itemsPerPage);

//     res.render('./admin/usersList', {
//       admin: admin,
//       users: users,
//       search,
//       status,
//       currentPage: page,
//       totalPages,
//       ITEMS_PER_PAGE,
//     });
//   } catch (error) {
//     console.error('Error occurred while loading Load products page:', error);
//     res.status(500).send('Error occurred while loading Load addProducts page.');
//   }
// };


//BLOCK AND UNBLOCK USER/////////////////////////////////
const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const blockUser = await UserDB.findById({ _id: userId });

    if (blockUser.is_blocked == 0) {
      
      await UserDB.findByIdAndUpdate(
        { _id: userId },
        { $set: { is_blocked: 1 } }
      );
      res.status(201).json({ message: true }); // Use true instead of 1
    } else {
      await UserDB.findByIdAndUpdate(
        { _id: userId },
        { $set: { is_blocked: 0 } }
      );
      res.status(201).json({ message: false }); // Use false instead of 0
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error occurred while processing the request." });
  }
};

//LOAD CATEGORY////////////////////////////////////

const loadCategory = async (req, res) => {
  try {
    const category = await categoryDB.find({});
    res.render("Category", { category });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADD CATEGORY////////////////////////////////////

const loadaddCategory = async (req, res) => {
  try {
    res.render("addCategory", { message: ""});
  } catch (error) {
    console.log(error.message);
  }
};

//FUNCTION ADD CATEGORY/////////////////////////////////////

const insertCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log(name, description);

    // Convert the category name to lowercase to make it case-insensitive
    const inputCategory = name.toLowerCase();
    
    // Check if a category with the same name (case-insensitive) already exists
    const existingCategory = await categoryDB.findOne({ name: { $regex: new RegExp(`^${inputCategory}$`, 'i') } });

    if (existingCategory) {
      res.render('addCategory', { message: 'Category Already Exists' });
    } else {
      const categoryData = new categoryDB({
        name: name,
        description: description,
      });

      const adddata = await categoryData.save();
      if (adddata) {
        res.redirect("/admin/category");
      } else {
        res.render("addCategory", { message: "An error Occurred" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


// Load Edit Category///////////////////////////

const loadEditcategory = async (req, res) => {
  try {
    const { name } = req.query;
    const catData = await categoryDB.findOne({ name:name });
    res.render("editCategory", { catData });
  } catch (error) {
    console.log(error.message);
  }
};

//Edit category////////////////
const editCategory = async (req, res) => {
  try {
    const qname=req.query.name
    const { name, description } = req.body;
  await categoryDB.updateOne( { name:qname},{$set:{name:name, description:description}})
   
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//LIST AND UNLIST CATEGORY////////////////////////////
const unlistCategory=async(req,res)=>
{
  try {
    const {catgname}=req.body
    const unlistCategory=await categoryDB.findOne({name:catgname})
    console.log(unlistCategory);

    if(unlistCategory.blocked==false)
    {
      console.log("block false");
      await categoryDB.updateOne({name:catgname},{$set:{blocked:true}});
      res.status(201).json({ message: true }); // Use true instead of 1

    }
    else
    {
      console.log("block true");
      await categoryDB.updateOne({name:catgname},{$set:{blocked:false}})
      res.status(201).json({ message: false });
    }
    
  } catch (error) {
    console.log(error.message);
   res
    .status(500)
      .json({ message: "Error occurred while processing the request." });
  }
}




module.exports = {
  loaddashboard,
  loadLogin,
  verifyLogin,
  loaduserlist,
  loaddashboard,
  blockUser,
  loadCategory,
  loadaddCategory,
  insertCategory,
  loadEditcategory,
  loadCategory,
  editCategory,
  unlistCategory,
  adminLogout
  
};
