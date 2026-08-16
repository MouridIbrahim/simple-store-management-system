const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./auth.model");
const AppError = require("../../utils/appError");

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashpassword,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const iscorrectPassword = await bcrypt.compare(password, user.password);
  if (!iscorrectPassword) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    return { message: genericMessage };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  console.log(`Password reset link for ${email}: ${resetUrl}`);

  const response = { message: genericMessage };

  if (process.env.NODE_ENV === "development") {
    response.resetUrl = resetUrl;
  }

  return response;
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new AppError("Token and password are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return {
    message: "Password has been reset successfully. You can now log in.",
  };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
