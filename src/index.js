const express = require('express');
const noteRouter = require('./routes/noteRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

const mongoose = require('mongoose')

// to convert request body to json (parsing)
app.use(express.json());

// app.use("/users", userRouter)
app.use("/users", userRouter);
app.use("/node", noteRouter)

mongoose.connect("mongodb+srv://admin:root123@nodeapis.eha4o5t.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp")
    .then(() => {
        app.listen(5000, () => {
            console.log("Connected to db");
            console.log("Server start on the port number 5000")
        })

    }).catch((error) => {
        console.log(error)
    });
