import { Router } from "express";
import { signupController , loginController , logoutController, getCurrentUser } from "../controllers/auth.controller";
import { authenticate } from "./../middlewares/auth.middleware";
const router = Router();

router.post("/signup" , signupController);
router.post("/login" , loginController);
router.post("/logout" , logoutController);
router.get("/me" , authenticate , getCurrentUser);

export default router;

