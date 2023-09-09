const UserDB = require("../model/usermodel");
const bcrypt = require("bcrypt");
const productDB = require("../model/productModel");
const categoryDB = require("../model/categorymodel");
const addressDB = require("../model/addressModel");
const BannerDB = require("../model/bannerModel");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { use } = require("../router/userRouter");
dotenv.config();
let otp;
let email2;
let emailreg;
let name2;

//SEND VERIFY EMAIL////////////////////////////////
const sendVerifymail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: "lukmanptrklm2000@gmail.com",
      to: email,
      subject: "Shoeniverse OTP",
      text: `Your Shoeniverse One time Password for account Verification is:${otp}`,
    };
    console.log(otp);
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Verification mail send to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//SENDLOGIN MAIL//////////////////////////////////////
const sendLoginmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: "lukmanptrklm2000@gmail.com",
      to: email,
      subject: "Shoeniverse OTP",
      text: `OTP For Shoeniverse Login :${otp},Do not share with anyone`,
    };

    console.log(otp);
    console.log(req.session.user_id);
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Verification mail send to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//OTP VALIDATION FOR REGISTRATION///////////////////////
const otpValidation = async (req, res) => {
  try {
    console.log("this is for registration");
    const otpinput = req.body.otp;
    const email = req.body.email;

    if (otpinput == otp) {
      const userData = await UserDB.findOneAndUpdate(
        { email: email },
        { $set: { is_verified: 1 } }
      );

      res.render("login", {
        userData,
        email2,
        messageS: "Successfully Verified.please Login.",
      });
    } else {
      res.render("onetimepasswordreg", {
        message: "invalid otp",
        inputEmail: email,
      });
    }
  } catch (err) {
    console.error("failed:", err);
    res.render("onetimepassword", {
      message: "An error occurred during verification",
    });
  }
};

//function password hash////////////////////
const securePassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};

// INSERTION OR SIGNUP OF NEW USER///////////////
const insertUser = async (req, res) => {
  try {
    const inputEmail = req.body.email;
    // emailreg=inputemail
    const existingUser = await UserDB.findOne({ email: inputEmail });
    if (existingUser) {
      res.render("signup", {
        message: "Email already registered, please use another gmail",
      });
    } else {
      const spassword = await securePassword(req.body.password);
      const user = new UserDB({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        password: spassword,
        is_admin: 0,
        is_verified: 0,
        is_blocked: false,
      });

      const userData = await user.save();
      if (userData) {
        //GENERATE A RANDOM OTP
        const otpgenerated = Math.floor(1000 + Math.random() * 999);
        otp = otpgenerated;
        const user = req.session.user_id;

        sendVerifymail(req.body.email, otpgenerated);
        res.render("onetimepasswordreg", { inputEmail, user });
        console.log(inputEmail);
      } else {
        res.render("signup", { alert: "Registration not completed" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD LOGIN PAGE////////////////////////////
const loadLogin = async (req, res) => {
  try {
    const user = req.session.user_id;
    res.render("login", { user });
  } catch (error) {
    console.log(error.message);
  }
};

//VERIFY LOGIN///////////////////////////////
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const email2 = email;
    const password = req.body.password;
    const inputEmail = req.body.email;
    const userData = await UserDB.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_blocked == 1) {
          res.render("login", {
            message: "Error Occured while login:Account Suspended!",
          });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/");
        }
      } else {
        res.render("login", { message: "Incorrect credentials" });
      }
    } else {
      res.render("login", { message: "Incorrect credentials" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD SIGNUP PAGE////////////////////////////////
const loadsignup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD SHOP PAGE//INCLUDES SEARCH SORT AND PAGINATION////////////////////////////////////
const loadshop = async (req, res) => {
  try {
  
    const user = req.session.user_id;
    const product = await productDB.find({ blocked: false });
    const category = await categoryDB.find({ blocked: false });
    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    let price = req.query.price || "Low"; // Default to sorting by low to high if no option is selected

    // let price = req.query.value;
    let categoryy = req.query.category || category;
    let Search = req.query.search || "";
    Search = Search.trim();

    console.log("Search:", Search);
    console.log("Categoryy:", categoryy);
    // const categoryData = await categoryDB.find({status:true},{categoryName:1,_id:0});
    let cat = [];
    for (i = 0; i < category.length; i++) {
      cat[i] = category[i].name;
    }

    let sort = price === "High" ? -1 : 1;
    // categoryy === "All"
    //   ? (categoryy = [...cat])
    //   : (categoryy = req.query.category.split(" "));
    // req.query.value === "High" ? (sort = -1) : (sort = 1);

    const producData = await productDB
      .find({
        name: { $regex: "^" + Search, $options: "i" },
        category: categoryy,
        blocked: false,
      })
      .skip(skip)
      .limit(limit)
      .sort({ price: sort }) // Sort by price with the determined order
      .populate({
        path: "offer",
        $match: {
          startingDate: { $lte: new Date() },
          expiryDate: { $gte: new Date() },
        },
      });
    console.log("Product Data After Search", producData);

    const productCount = await productDB.countDocuments({
      name: { $regex: Search, $options: "i" },
      blocked: false,
      // category:  categoryy
    });

    const totalPage = Math.ceil(productCount / limit);
    console.log("total pAge", totalPage);
    console.log("limit", limit);
    console.log("Count of products", productCount);
    // const loggedIn = req.session.user_id;
    if (user) {
      res.render("shop", {
        totalPage,
        product: producData,
        categoryy: category,
        user,
        page,
        Search,
        price,
        cat: categoryy,
        category,
      });
    } else {
      res.render("shop", {
        totalPage,
        product: producData,
        categoryy: category,
        user,
        page,
        Search,
        price,
        cat: categoryy,
        category,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//CONTACT PAGE////////////////////////////
const loadcontact = async (req, res) => {
  try {
    const user = req.session.user_id;
    res.render("contact", { user });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ABOUT PAGE/////////////////////////
const loadabout = async (req, res) => {
  try {
    const user = req.session.user_id;
    res.render("about", { user });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD HOME PAGE////////////////////////////
const loadhome = async (req, res) => {
  try {
    const user = req.session.user_id;
    console.log(user, "this is home session");
    const bannerData = await BannerDB.find();
    const product = await productDB
      .find({ blocked: false })
      .populate({
        path: "offer",
        $match: {
          startingDate: { $lte: new Date() },
          expiryDate: { $gte: new Date() },
        },
      });
    res.render("home", { product, user, bannerData });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD WISHLIST PAGE////////////////////////
const loadwishlist = async (req, res) => {
  try {
    const user = req.session.user_id;
    res.render("wishlist", { user });
  } catch (error) {
    console.log(error.message);
  }
};

//FUNCTION USERLOGOUT/////////////////////////////////
const userLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err.message);
      }
      res.redirect("/login");
    });
  } catch (error) {
    console.log(error.message);
  }
};

//RESEND OTP FOR FORGOTPASSWORD///////////////////////////
const resendOTPlogin = async (req, res) => {
  try {
    const email = req.params.email;
    const otpgenerated = Math.floor(1000 + Math.random() * 999);
    otp = otpgenerated;
    console.log(email);
    sendLoginmail(email, otpgenerated);
    res.render("onetimepassword", { inputEmail: email });
  } catch (error) {
    console.log(error.message);
  }
};

//RESEND OTP FOR USER REGISTRATION/////////////////////
const resendOTPreg = async (req, res) => {
  try {
    const email = req.params.email;
    const otpgenerated = Math.floor(1000 + Math.random() * 999);
    otp = otpgenerated;
    console.log(email);
    sendVerifymail(email, otpgenerated);
    res.render("onetimepasswordreg", { inputEmail: email });
  } catch (error) {
    console.log(error.message);
  }
};

//USER PROFILE///////////////////////////////////////////
const loadprofile = async (req, res) => {
  try {
    const user = req.session.user_id;
    const userprofile = await UserDB.findOne({ _id: user });
    console.log(user);
    console.log(userprofile);
    res.render("profile", { user, userprofile });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD CHANGE PASSWORD PAGE/////////////////////////
const loadchangePassword = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      res.render("changePassword", { user });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//CHANGE PASSWORD FUNCTION ON USER PROFILE//////////////////////
const changePassword = async (req, res) => {
  try {
    const user = await UserDB.findById(req.session.user_id);

    if (!user) {
      // Handle user not found
      return res.redirect("/login");
    }

    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    // Validate new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      // Handle password mismatch
      return res.redirect("/changePassword?passwordMismatch=true");
    }
    // Validate current password
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      // Handle incorrect current password
      return res.redirect("/changePassword?passwordMismatch=true");
    }
    // Update user's password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.redirect("/changePassword?passwordChanged=true");
  } catch (error) {
    // Handle error
    console.error(error);
    res.redirect("/changePassword");
  }
};

//LOAD EDIT PROFILE PAGE//////////////////////////////
const loadEditProfile = async (req, res) => {
  try {
    const userprofile = await UserDB.findById({ _id: req.session.user_id });
    const user = req.session.user_id;
    res.render("editProfile", { user, userprofile });
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT PROFILE FUNCTION////////////////////////////////////

const editProfile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { name, mobile } = req.body;

    // Update user profile details in the database
    await UserDB.findByIdAndUpdate(userId, { name, mobile });

    // Redirect to user profile page with updated details
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
};

// FORGET PASSWORD/////////////////////////////////////////////
const loadforgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

//forget password function////with OTP////////////////////////////////////////////////

const forgotPassword = async (req, res) => {
  try {
    console.log(req.session.user_id, "THIS IS THE SESSION");
    const email = req.body.email;
    const inputEmail = email;
    const userprofile = await UserDB.findOne({ email: email });

    if (userprofile) {
      const otpgenerated = Math.floor(1000 + Math.random() * 999);
      otp = otpgenerated;

      sendLoginmail(email, otpgenerated);
      res.render("onetimepassword", { email, otpgenerated, inputEmail });
    } else {
      res.render("forgotPassword", { message: "Couldn't find your account" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// OTPVALIDATION FOR FORGORPASSWORD/////////////////////////
const otpValidationlogin = async (req, res) => {
  try {
    console.log("this is for Forgot Password");
    const otpinput = req.body.otp;
    const email = req.body.email;

    if (otpinput == otp) {
      //   const userData = await UserDB.findOne({ email: email });
      //   await UserDB.findOneAndUpdate(
      //     { email: email },
      //     { $set: { is_verified: 1 } }
      //   );
      // req.session.user_id = userData._id;
      console.log("otp Verified");
      res.redirect(`/changeforgotPassword?email=${email}`);
    } else {
      res.render("onetimepassword", {
        message: "invalid otp",
        inputEmail: email,
      });
    }
  } catch (err) {
    console.error("failed:", err);
    res.render("onetimepassword", {
      message: "An error occurred during verification",
    });
  }
};

//loadchangeforgotPassword///////////////////////////////
const loadchangeforgotPassword = async (req, res) => {
  try {
    const email = req.query.email;

    console.log(email, "this is the emailer when loading the page");
    res.render("changeforgotPassword", { email });
    console.log("email when rendered");
  } catch (error) {
    console.log(error.message);
  }
};

// CHANGE FORGOT PASSWORD TO NEW PASSWORD////////////////////
const changeForgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await UserDB.findOne({ email: email });
    if (userData) {
      const newPassword = req.body.newPassword;
      const confirmNewPassword = req.body.confirmNewPassword;
      const passwordMatch = newPassword === confirmNewPassword;
      if (passwordMatch) {
        const isLengthValid = newPassword.length >= 8;
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasDigit = /[0-9]/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?]/.test(
          newPassword
        );
        const passwordvalidated =
          isLengthValid &&
          hasUpperCase &&
          hasLowerCase &&
          hasDigit &&
          hasSpecialChar;
        if (passwordvalidated) {
          const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
          userData.password = hashedNewPassword;
          await userData.save();
          res.render("login", {
            messageS: "Password Reset Successfully,Please Login",
          });
        } else {
          return res.redirect(
            `/changeforgotPassword?passwordvalidated=false&&email=${req.body.email}`
          );
        }
      } else {
        return res.redirect(
          `/changeforgotPassword?passwordMismatch=true&&email=${req.body.email}`
        );
      }
    }
  } catch (error) {
    console.error(error);
    res.redirect("/changeforgotPassword");
  }
};

module.exports = {
  loadLogin,
  loadsignup,
  loadshop,
  loadcontact,
  loadabout,
  loadhome,
  loadwishlist,
  securePassword,
  insertUser,
  verifyLogin,
  userLogout,
  otpValidation,
  sendVerifymail,
  sendLoginmail,
  resendOTPlogin,
  resendOTPreg,
  otpValidationlogin,
  loadprofile,
  loadEditProfile,
  loadchangePassword,
  changePassword,
  editProfile,
  loadforgotPassword,
  forgotPassword,
  loadchangeforgotPassword,
  changeForgotPassword,
};
