const Address = require("../model/addressModel");
const User = require("../model/usermodel");

const loadAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    const userprofile = await User.findOne({ _id: user });
    const addressdata = await Address.findOne({ userId: user });
    console.log(addressdata);
    if (user) {
      res.render("address", { user, userprofile, addressdata });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddaddress = async (req, res) => {
  try {
    if (req.session.user_id) {
      const user = req.session.user_id;
      if (user) {
        res.render("addAddress", { user });
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addNewaddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const {
      userName,
      mobile,
      alternativeMob,
      address,
      city,
      state,
      pincode,
      landmark,
    } = req.body;
    const addressData = await Address.findOne({ userId: userId });
    console.log(userId);
    console.log("this is add new address function", { addressData });

    if (addressData) {
      const updatedAddress = await Address.updateOne(
        { userId: userId },
        {
          $push: {
            addresses: {
              userName: userName,
              mobile: mobile,
              alternativeMob: alternativeMob,
              address: address,
              city: city,
              state: state,
              pincode: pincode,
              landmark: landmark,
            },
          },
        }
      );
      if (updatedAddress) {
        res.redirect("/profile");
      } else {
        res.redirect("/profile");
      }
    } else {
      const userAddress = new Address({
        userId: userId,
        address: [
          {
            userName: userName,
            mobile: mobile,
            alternativeMob: alternativeMob,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            landmark: landmark,
          },
        ],
      });
      const addressData = await userAddress.save();
      if (addressData) {
        res.redirect("/profile");
      } else {
        res.render("/addAddress");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const loadEditAddress=async(req,res)=>
// {
// try {
//     if (req.session.user_id) {
//         const user = req.session.user_id;
//         const addressId = req.query.id;
//         const addressData = await Address.findOne({ user: user ,"addresses._id":addressId})
//         const aData = addressData.addresses.find((addr) => addr._id.toString()=== addressId);
      
//         if (user) {
//           res.render("editAddress", {user,aData});
//         } else {
//           res.redirect("/");
//         }
//       } else {
//         res.redirect("/login");
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
    
// }
// const loadEditAddress =  async(req,res,next)=>{
//     try {
//         const userId = req.session.user_id;
//         const addressId = req.query.id;
//         const addressData = await Address.findOne({ userId: userId ,"addresses._id":addressId})
//         const aData = addressData.addresses.find((addr) => addr._id.toString()=== addressId);
//         res.render("editAddress", { address: aData ,loggedIn :userId,addresses})       
//     } catch (error) {
//         console.log(error.message);
//         next(error);
//     }
// }



module.exports = {
  loadAddress,
  loadAddaddress,
  addNewaddress
};
