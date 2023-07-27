const UserDB = require("../model/usermodel");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
let otp;
let email2;
let emailreg;
let name2;


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

const sendLoginmail = async ( email, otp) => {
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

const otpValidation = async (req, res) => {
  try {
    const otpinput = req.body.otp;
    const email = req.query.email;

    if (otpinput == otp) {
      const userData = await UserDB.findOneAndUpdate(
        { email: email },
        { $set: { is_verified: 1 } }
      );

      res.render("login", {
        userData,
        email2,
        message: "Success!!!",
      });
    } else {
      res.render("onetimepassword", { message: "invalid otp" });
    }
  } catch (err) {
    console.error("failed:", err);
    res.render("onetimepassword", {
      message: "An error occurred during verification",
    });
  }
};

//function password hash
const securePassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};

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

        sendVerifymail(req.body.email, otpgenerated);
        res.render("onetimepassword", { inputEmail });
        console.log(inputEmail);
      } else {
        res.render("signup", { alert: "Registration not completed" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD LOGIN
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//VERIFY LOGIN
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
        const otpgenerated = Math.floor(1000 + Math.random() * 999);
        otp = otpgenerated;

        sendLoginmail(req.body.email, otpgenerated);
        res.render("onetimepassword", { inputEmail });
        console.log(inputEmail);

        req.session.user_id = userData._id;
        res.redirect("/");
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

const loadsignup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};

const loadshop = async (req, res) => {
  try {
    res.render("shop");
  } catch (error) {
    console.log(error.message);
  }
};

const loadproduct = async (req, res) => {
  try {
    res.render("product-single");
  } catch (error) {
    console.log(error.message);
  }
};

const loadcart = async (req, res) => {
  try {
    res.render("cart");
  } catch (error) {
    console.log(error.message);
  }
};

const loadcontact = async (req, res) => {
  try {
    res.render("contact");
  } catch (error) {
    console.log(error.message);
  }
};

const loadcheckout = async (req, res) => {
  try {
    res.render("checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const loadabout = async (req, res) => {
  try {
    res.render("about");
  } catch (error) {
    console.log(error.message);
  }
};
const loadhome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

const loadwishlist = async (req, res) => {
  try {
    res.render("wishlist");
  } catch (error) {
    console.log(error.message);
  }
};
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTPlogin=async(req,res)=>
{
  try{
    const email = req.params.email;
    const otpgenerated = Math.floor(1000 + Math.random() * 999);
    otp = otpgenerated;
    console.log(email);
    sendLoginmail(email, otpgenerated);
    res.render("onetimepassword", { inputEmail:email });
  }
  catch(error)
  {
    console.log(error.message);
  }
}

const resendOTPreg=async(req,res)=>
{
  try{
     const email = req.params.email;
    const otpgenerated = Math.floor(1000 + Math.random() * 999);
    otp = otpgenerated;
    console.log(email);
    sendVerifymail(email, otpgenerated);
    res.render("onetimepassword", { inputEmail:email });

  }
  catch(error)
  {
    console.log(error.message);
  }
}





module.exports = {
  loadLogin,
  loadsignup,
  loadproduct,
  loadshop,
  loadcontact,
  loadcart,
  loadcheckout,
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
  resendOTPreg
  
};
