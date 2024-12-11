const roleMiddleware = (roles) => {
    return (req, res, next) => {
        const user = req.user;

        // console.log(user.role);

        if(!roles.includes(user.role)) {
            return res.status(403).json({message: 'Access dinied. You do not have the required role'})
        }

        next();
        
    }
}

// const roleMiddleware = (allowedRoles) => {
//     return (req, res, next) => {
//         if (!allowedRoles.includes(req.user.role)) {
//             return res.status(403).json({ message: 'You are not authorized to perform this action' });
//         }
//         next();
//     };
// };

export {roleMiddleware}