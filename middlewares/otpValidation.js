const nodemailer = require("nodemailer");

module.exports={
    mailTransporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'mdshafi112017@gmail.com',
            pass: 'iavgljbnbkrugtli'
        },
    }),
      
     OTP : `${Math.floor(1000 + Math.random() * 9000)}`,

}
