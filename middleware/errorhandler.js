// const error404 = (req, res, err) => {
//   res.status(404);
//   if (req.accepts("html")) {
//     res.render("error/404", { url: req.url });
//     return;
//   }
// };
// const error500 = (err, req, res, next) => {
//   const errStatus = err.statusCode || 500;
//   const errMsg = err.message || "Something went wrong";

//   res.status(errStatus).render("error500");
// };

// module.exports = {
//   error500,
//   error404,
// };
