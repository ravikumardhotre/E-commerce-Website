const validate = require("../validation/validator");
const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Auth } = require("two-step-auth");
const fast2sms = require("fast-two-sms");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//---------------------------------------------------------------------------------------
const createUser = async function (req, res) {
  try {
    const requestBody = req.body;
    const { name, email, password, confirmPassword } = requestBody;
    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide user details",
      });
      return;
    }

    if (!validate.isValid(name)) {
      res.status(400).send({ status: false, message: `name is required` });
      return;
    }
    if (typeof name != "string") {
      return res
        .status(400)
        .send({ status: false, message: "Numbers are not allowed" });
    }

    if (!validate.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }
    if (!validate.validateEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }
    const isEmailAlreadyUsed = await userModel.findOne({ email });

    if (isEmailAlreadyUsed) {
      res.status(400).send({
        status: false,
        message: `${email} email address is already registered`,
      });
      return;
    }

    if (!validate.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }
    if (!validate.isValid(confirmPassword)) {
      res.status(400).send({
        status: false,
        message: `confirmPassword is required correct`,
      });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).send({ status: false, message: "password not match" });
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, saltRounds); //encrypting password by using bcrypt.
    const encryptedconfirmPassword = await bcrypt.hash(
      confirmPassword,
      saltRounds
    ); //encrypting password by using bcrypt.

    userData = {
      name,
      email,
      password: encryptedPassword,
      confirmPassword: encryptedconfirmPassword,
      address: requestBody.address,
      phone: requestBody.phone,
      
    };

    const createUserData = await userModel.create(userData);
    res.status(201).send({
      status: true,
      msg: "successfully created",
      data: createUserData,
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};
//---------------------------------------------------------------------------------------------------------------//

const loginUser = async function (req, res) {
  try {
    const requestBody = req.body;
    let userIdFromHeader = req.header('user')

    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login details",
      });
      return;
    }

    // Extract params
    const { email, password, number } = requestBody;

    // Validation starts
    if (!validate.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!validate.validateEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }

    if (!validate.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }

    // Validation ends

    const user = await userModel.findOne({ email: email });

    if (!user) {
      res
        .status(401)
        .send({ status: false, message: `Invalid login credentials` });
      return;
    }

    const encryptedPassword = await bcrypt.compare(password, user.password); //converting normal password to hashed value to match it with DB's entry by using compare function.

    if (!encryptedPassword)
      return res.status(401).send({
        status: false,
        message: `Login failed! password is incorrect.`,
      });

    const resSend = await Auth(email, process.env.JWT_SECRET);
    res.header("otp", resSend.OTP);
    res.header("user", userIdFromHeader);

    res.cookie("userOtp", resSend.OTP, {
      expires: new Date(Date.now() + 200000),
      httpOnly: true,
    });

    if (!validate.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login details",
      });
      return;
    }
    if (!validate.isValid(number)) {
      res.status(400).send({ status: false, message: `number is required` });
      return;
    }

    var options = {
      authorization:
        "WSb6ZvXVD0h1AN58yuRqFUjIKzBpGx2iweQcMnTLE3PCs4foHJihwldaLp04Skejyz9En8c2RbgMf6WI", // api key
      message: "Your OTP is: " + resSend.OTP,
      numbers: [number],
    };
    console.log(options);
    // send this message to the client
    fast2sms.sendMessage(options);
  
    return res.status(202).send({ status: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};


const enterOtp = async function (req, res) {
  try {
    let otpFromBody = req.body.otp;
    let otpFromcookies =  req.cookies.userOtp;
    let userIdFromHeader = req.header('user')

    console.log(otpFromcookies);

    if (isNaN(otpFromBody)) {
      return res
        .status(400)
        .send({ status: false, message: `Please enter valid OTP.` });
    }

    // if (otpFromcookies != otpFromBody ) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: `Login Failed! Incorrect OTP.` });
    // }

    const token = await jwt.sign(
      {
        userIdFromHeader,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1800,
      },
      process.env.JWT_SECRET
    );
   
    res.header("x-api-key", token);

    res.status(200).send({ status: true, message: `user login successfully`, data: token });
  
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};




const loginOutUser = async function (req, res) {
  try {

    res.clearCookie("userOtp");
 
    res.status(200).send({ status: true, message: `user logout successfully` });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createUser, loginUser, loginOutUser, enterOtp };
