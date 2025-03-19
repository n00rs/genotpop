import { signUpController } from "./signup.controller.ts";
import { loginController } from "./login.controller.ts";
import { resetPasswordController } from "./resetPassword.controller.ts";

const refreshTokenController = async({ body, ...source }) => {
  console.log({ body, source });
  return {}
};

export {
  loginController,
  signUpController,
  resetPasswordController,
  refreshTokenController,
};
