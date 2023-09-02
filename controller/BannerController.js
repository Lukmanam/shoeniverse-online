const BannerDB = require("../model/bannerModel");



//SHOW BANNERLIST///////////////////////////////
const loadBanner = async (req, res, next) => {
    try {
        const banners = await BannerDB.find({});
        res.render("banner", { banners });
    } catch (error) {
        console.log(error.message);
    }
};



//LOAD ADD BANNER////////////////////////////////////
const loadaddBanner = async (req, res, next) => {
    try {
        res.render("addBanner");
    } catch (error) {
        console.log(error.message);
    }
};



// ADD BANNER////////////////////////////////////////
const addBanner = async (req, res, next) => {
    try {
        const { info, description, title } = req.body;
        const image = req.file.filename;
        console.log("here is banner");
        const banner = new BannerDB({
            image: image,
            info: info,
            description: description,
            title: title,
        });
        await banner.save();
        res.redirect("/admin/bannerlist");
    } catch (error) {
        console.log(error.message);
    }
};


//LOAD EDIT BANNER///////////////////////////////////
const loadeditBanner = async (req, res, next) => {
    try {
        const id = req.query.id;
        const bannerData = await BannerDB.findOne({ _id: id });
        res.render("editBanner", { bannerData });
    } catch (error) {
        console.log(error.message);
    }
};



//EDIT BANNER FUNCTION///////////////////////////////
const editBanner = async (req, res, next) => {
    try {
        const id = req.query.id;
        console.log(id);
        const { info, title, description } = req.body;
        console.log(info,title);
        if (req.file && req.file.filename) {
            const image=req.file.filename
            await BannerDB.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        image: image,
                        description: description,
                        title: title,
                    },
                }
            );
          
        } else {
            console.log(id);
            await BannerDB.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                       
                        title: title,
                        description: description,
                    },
                }
            );
            console.log("UPDATED");
        }
        res.redirect("/admin/bannerlist");
    } catch (error) {
        console.log(error.message);
    }
};



//DELETE BANNER//////////////////////////////////
const deleteBanner=async (req,res,next)=>
{
try {
    const id=req.query.id
    await BannerDB.findOneAndDelete({_id:id})
    res.redirect("/admin/bannerlist");
} catch (error) {
    console.log(error.message);
}
}





module.exports = {
    loadBanner,
    loadaddBanner,
    addBanner,
    loadeditBanner,
    editBanner,
    deleteBanner
};
