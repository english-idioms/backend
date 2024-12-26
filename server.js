const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./router/routes"); 
const paymentRoutes = require("./router/paymentRoutes")
require("dotenv").config();


mongoose.set("strictQuery", false);

const PORT = process.env.PORT || 8000;

//console.log(process.env.STRIPE_SECRET_KEY); 

app.use(express.json());
app.use(cors());

//соединение с MongoDB
mongoose
.connect(process.env.MONGODB_LINK)
.then(()=>console.log("We are connected to MONGO!!!"))
.catch((err)=> console.log(err))

app.use(routes)
app.use('/payment', paymentRoutes)


app.listen(PORT, () => {
    console.log(`I am your sweety PORTIK ${PORT}`)
})

