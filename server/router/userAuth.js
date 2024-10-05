import express from 'express'
import { userRegister, userLogin, allUsers, dashBoard } from '../controller/userController.js'
import { protect } from '../middleware/protect.js'

const router = express.Router()

// User Registration
router.post('/register', userRegister)

// User Login
router.post('/login', userLogin)

//allusers
router.get('/all_user', allUsers)

router.get('/dashboard',protect,dashBoard)

export default router