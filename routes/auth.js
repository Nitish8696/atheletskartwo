const express = require("express");

const router = express.Router();
const nodemailer = require("nodemailer");

const User = require("../models/User.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

router.post("/register", async (req, res) => {
  // Convert the username to lowercase for case-insensitivity
  // const username = req.body.formData.username.toLowerCase();
  const email = req.body.formData.email.toLowerCase();
  const name = req.body.formData.name;
  const mobile = req.body.formData.mobile;

  const newUser = new User({
    email: email,
    name: name,
    mobile: mobile,
    password: CryptoJS.AES.encrypt(
      req.body.formData.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    // Check if the username or email already exists (case-insensitive)
    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ status: 409, msg: "username or email already exists" });
    }

    // Save the new user if no conflict is found
    const savedUser = await newUser.save();
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "465", // true for SSL, false for TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome",
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Thank Your For Sign Up</h2>
        <p style="color: #555; font-size: 16px;">
          Click the button Below for Sign In.
        </p>
        <a 
          href="https://athleteskart.in/login" 
          style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007BFF; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;"
        >
          Sing In
        </a>
        <p style="color: #bbb; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} athleteskart. All rights reserved.
        </p>
      </div>
    </div>`,
    });
    res.status(200).json({ status: 200, msg: "user created successfully" });
  } catch (err) {
    res.status(500).json({ status: 500, msg: err.message, hello: "hello" });
  }
});
router.post("/login", async (req, res) => {
  try {
    // Convert the username to lowercase for case-insensitivity
    const email = req.body.formData.email.toLowerCase();

    // Find the user by the case-insensitive username
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        status: 401,
        msg: "User Not Found With This username",
      });
    }

    // Decrypt the stored password
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted password matches the input
    if (originalPassword !== req.body.formData.password) {
      return res
        .status(401)
        .json({ status: 401, msg: "Password is incorrect" });
    }

    // Generate an access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC
    );

    // Exclude password from the response
    const { password, isAdmin, ...others } = user._doc;

    res.status(200).json({ ...others, isAdmin, accessToken, status: 200 });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found." });

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Update user with reset token and expiry
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send reset email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "465", // true for SSL, false for TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password",
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555; font-size: 16px;">
          Click the button below to reset your password. This link is valid for 15 minutes.
        </p>
        <a 
          href="${resetLink}" 
          style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007BFF; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;"
        >
          Reset Password
        </a>
        <p style="color: #999; font-size: 14px;">
          If you did not request this, please ignore this email.
        </p>
        <p style="color: #bbb; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} athleteskart. All rights reserved.
        </p>
      </div>
    </div>`,
    });

    res.status(200).json({ message: "Reset password email sent." });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  console.log(req.body);
  try {
    const { resetToken, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, resetToken });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // Hash new password
    const hashedPassword = await CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASS_SEC
    ).toString();

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
