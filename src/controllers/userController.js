const { JsonWebTokenError } = require('jsonwebtoken');
const userModel = require('../models/users');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECRET_KEY = "NOTEAPIS"


const passwordChecks = (password) => {
    if (password.length < 8 || password.length > 128) {
        return "Password should be between 8 and 128 characters.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password should contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
        return "Password should contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
        return "Password should contain at least one digit.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return "Password should contain at least one special character.";
    }
    return null;
};


const signup = async (req, res) => {

    const { username, email, password } = req.body;

    
    // Password Validation
    const passwordError = passwordChecks(password);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    try {

        // checking for existing users
        const existinguser = await userModel.findOne({ email: email });
        if (existinguser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Password Hashingd
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
