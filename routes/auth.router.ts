import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  resetPasswordController,
  signUpController,
} from "../libs/authentication/index.ts";
import { expCallback } from "../libs/common/index.ts";
const router = Router();

router.post("/login",expCallback(loginController));
router.post("/sign_up",expCallback(signUpController));
router.post("/reset_password",expCallback(resetPasswordController));
router.post("/refresh_token",expCallback(refreshTokenController));

export default router;
