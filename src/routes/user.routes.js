import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { registerUser, loginUser, updateUser, deleteUser, updateOwnprofile} from "../controllers/user.controller.js"

const router = Router()

router.post('/register', registerUser)

router.post('/login', loginUser);

// Admin: Update User
router.put('/update/:userId', verifyJWT, roleMiddleware(['Admin']), updateUser);

// Admin: Delete User
router.route('/delete/:userId').delete(verifyJWT, roleMiddleware(['Admin']), deleteUser);

// staff/customer : update own profile
router.put('/update-profile/:userId', verifyJWT, roleMiddleware(['Staff', 'Customer']), updateOwnprofile);


export default router