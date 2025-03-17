import { signUpController } from "./signup.controller.ts";

const loginController = async({ body, ...source }) => {
  console.log({ body, source });
  return {}
};

 

const resetPasswordController = async({ body, ...source }) => {
  console.log({ body, source });
  return {}
};

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
