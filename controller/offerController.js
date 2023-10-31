const offerDB = require("../model/offerModel")


//LOAD OFFER PAGE//////////////////////////////////////
const loadOffer = async (req, res) => {
    try {
        const now=new Date()
        const updateOfferData=await offerDB.find({})
      
        for (const offer of updateOfferData) {
            if (offer.expiryDate < now) {
                await offerDB.deleteOne({ _id: offer._id });
            }
        }       
        const offerData = await offerDB.find({});
        res.render('offers', { offerData,now })
        
    } catch (error) {
        console.log(error.message);
    }
}


//load Add Offer Page///////////////////////////////////
const loadaddOffer=async(req,res,next)=>{
    try {
        res.render('addOffer')
    } catch (error) {
        console.log(error.message);
    }
}


//Add offer function////////////////////////////////////
const addOffer=async(req,res,next)=>{
    const { startingDate,expiryDate,percentage}=req.body;
    const name = req.body.name.toUpperCase()
    const offer=new offerDB({
        name:name,
        startingDate:startingDate,
        expiryDate:expiryDate,
        percentage:percentage
    })
    await offer.save()
    res.redirect("/admin/offerlist")
}



module.exports={
    loadOffer,
    loadaddOffer,
    addOffer
}