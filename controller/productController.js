const productDB = require("../model/productModel");
const UserDB = require("../model/usermodel");
const categoryDB = require("../model/categorymodel");
const productController = require("../controller/productController");
const fs = require("fs");
const path = require("path");

// Load Product List //////////////(ADMIN SIDE)

// const loadproductlist = async (req, res) => {
//   try {

//     const product = await productDB.find({});
//     res.render("productList", { product });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const loadproductlist = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm; // Assuming the search term is passed as a query parameter
    let query = {}; // Define an empty query object

    // If a search term is provided, add it to the query object to filter the products
    if (searchTerm) {
      query = { $text: { $search: searchTerm } };
    }

    const product = await productDB.find(query).populate("category");
    res.render("productList", { product, searchTerm });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADD PRODUCT//////////////////////////
const loadaddProduct = async (req, res) => {
  try {
    const category = await categoryDB.find({});
    res.render("addProduct", { message: " ", category });
  } catch (error) {
    console.log(error.message);
  }
};

//ADD PRODUCT//////////////////////////////////////////////

const addProduct = async (req, res) => {
  try {
    let image = [];

    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        image.push(req.files[i].filename);
      }
    }

    const { name, category, price, quantity, description } = req.body;
    console.log(category);
    const productData = new productDB({
      name: name,
      category: category,
      price: price,
      quantity: quantity,
      description: description,
      image: image,
    });

    const addproductData = await productData.save();
    if (addproductData) {
      res.redirect("/admin/productList");
    } else {
      res.render("addProduct", { message: "something went wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// EDIT PRODUCT////////////////////////////////////////////

const editProduct = async (req, res) => {
  try {
    const qid = req.query.id;
    const { name, category, price, quantity, description } = req.body;
    var imageArr = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imageArr.push(req.files[i].filename);
      }
    }
    console.log(imageArr);

    if (req.files && req.files.length > 0) {
      await productDB.updateOne(
        { _id: qid },
        {
          $set: {
            name: name,
            description: description,
            quantity: quantity,
            price: price,
            category: category,
            image: imageArr,
          },
        }
      );
      res.redirect("/admin/productList");
    } else {
      await productDB.updateOne(
        { _id: qid },
        {
          $set: {
            name: name,
            description: description,
            quantity: quantity,
            price: price,
            category: category,
          },
        }
      );
      res.redirect("/admin/productList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD EDIT PRODUCT/////////////////////////////////////////////////
// const loadeditproduct=async(req,res)=>
// {
//     try {
//         const id= req.query.product;
//         const product=await productDB.findOne({_id: id});
//         const category=await categoryDB.find({});
//         res.render("editProduct",{product,category});
//     } catch (error) {
//         console.log(error.message);

//     }
// }
const loadeditProduct = async (req, res) => {
  try {
    const id = req.query.product;
    const product = await productDB.findOne({ _id: id });
    const category = await categoryDB.find({});
    res.render("editProduct", { product, category });
  } catch (error) {
    console.log(error.message);
  }
};

const unlistProduct = async (req, res) => {
  try {
    const { prodName } = req.body;
    const unlistProduct = await productDB.findOne({ name: prodName });
    console.log(unlistProduct);

    if (unlistProduct.blocked == false) {
      console.log("block false");
      await productDB.updateOne(
        { name: prodName },
        { $set: { blocked: true } }
      );
      res.status(201).json({ message: true }); // Use true instead of 1
    } else {
      console.log("block true");
      await productDB.updateOne(
        { name: prodName },
        { $set: { blocked: false } }
      );
      res.status(201).json({ message: false });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error occurred while processing the request." });
  }
};
const loadProductDetail = async (req, res) => {
  try {
    const user = req.session.user_id;
    const id = req.query.id;
    const product = await productDB.findById({ _id: id });
    console.log(product, "OKKK");
    res.render("productDetails", { product, user });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteImage = async (req, res) => {
  try {
    const productId = req.query.id;
    const fileName = req.query.fileName;
    if (productId && fileName) {
      // delete from database
      const updatedProd = await productDB.findByIdAndUpdate(
        productId,
        { $pull: { images: fileName } },
        { new: true }
      );
      if (!updatedProd) {
        throw new Error("Product not found");
      }

      console.log("hi", productId);
      // Delete the image file from storage

      await fs.unlink(
        path.join(__dirname, "../public/adminAsset/IMAGES", req.query.fileName),
        (error) => {
          if (error) {
            console.log(error.message);
          }
        }
      );
      res.redirect(`/admin/editProduct?product=${productId}`);
    } else {
      throw new Error("Invalid request parameters");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadproductlist,
  loadaddProduct,
  addProduct,
  editProduct,
  loadeditProduct,
  unlistProduct,
  loadProductDetail,
  deleteImage,
};
