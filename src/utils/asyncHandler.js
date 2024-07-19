export const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


// const asyncHandler = (fn) => {
//     async (err, req, res, next) => {
//         try {
//             await fn(err, req, res, next)
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
// } 
