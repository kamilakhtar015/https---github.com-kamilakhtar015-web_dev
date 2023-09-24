const { JsonWebTokenError } = require('jsonwebtoken');
const userModel = require('../models/users');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECRET_KEY = "NOTEAPIS"

const signup = async (req, res) => {

    const { username, email, password } = req.body;
    try {

        // checking for existing users
        const existinguser = await userModel.findOne({ email: email });
        if (existinguser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user
        const result = await userModel.create({
            email: email,
            password: hashedPassword,
            username: username
        });

        // Token creation
        const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
        res.status(201).json({ user: result, token: token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}





const signin = async (req, res) => {
    const { email, password } = req.body;

    try {

        // checking for wheather user exists or not
        const existinguser = await userModel.findOne({ email: email });
        if (!existinguser) {
            return res.status(404).json({ message: "User not exists" });
        }

        // matching passwords
        const matchPassword = await bcrypt.compare(password, existinguser.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        // Generating token
        const token = jwt.sign({ email: existinguser.email, id: existinguser._id }, SECRET_KEY);
        res.status(200).json({ user: existinguser, token: token });

        // const { password, ...other } = existinguser._doc;
        // res.status(200).json({ user: other, token: token });



    } catch (error) {
        console.log(error);
        // res.status(500).json({ message: "Something went wrong" })

        res.status(500).json({ message: "Something went wrong", error: error.message });

    }
}

module.exports = { signup, signin };