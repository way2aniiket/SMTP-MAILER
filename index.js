const express = require('express');
const app = express();
let PORT = 8080;
require('dotenv').config();
const path = require('path');
const multer = require('multer');

var storage = multer.diskStorage({
    destination:function(req,file,cb){  
        cb(null,"./images")
    },
    filename : function (req,file,cb) {
        cb(null,file.fieldname + "_" + Date.now() + file.originalname)
    }
})

var upload = multer({ storage:storage,limits: { fieldSize: 10 * 1024 * 1024 }})

// app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
const nodemailer = require("nodemailer");
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT : ${PORT}`);
    
})

app.get("/", async (req,res) => {
    res.render("mail")
})
app.post("/sendEmail", upload.array('files', 5),async (req,res) => {
    let {to,cc,bcc,subject,message} = req.body
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.APP_PASSWORD
        }
    });
    
    const attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path
    }))
    const mailOptions = {

            from: {
                name: 'Aniket Kumar',
                address : process.env.USER
            }, // sender address
            to: [to],
            cc: [cc] || undefined,
            bcc: [bcc] || undefined, // list of receivers
            subject: subject, // Subject line
            text: message, // plain text body
            attachments: attachments
            // html: "<b>Hello world?</b>", // html body
            // attachments : [
            //     {
        //         filename : 'Sem.pdf',
        //         path: path.join(__dirname   , 'Sem.pdf'),
        //         contentType : 'application/pdf'
        //     },
        //     {
        //         filename : 'car.jpg',
        //         path: path.join(__dirname   , 'car.jpg'),
        //         contentType : 'image/jpg'
        //     }
        // ]
      };
console.log("mailOptions",mailOptions);

    const sendMail = async (transporter,mailOptions) => {
          try {
              await transporter.sendMail(mailOptions);
              console.log("Email sent successfully");
              res.redirect("/");
              
            } catch (error) {
                console.error("Error sending email:", error);
                res.status(500).send("Failed to send email");
            }
        }
    sendMail(transporter,mailOptions);
    
})