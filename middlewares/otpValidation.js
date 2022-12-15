const nodemailer = require("nodemailer");

module.exports={
    mailTransporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'mdshafi112017@gmail.com',
            pass: 'iavgljbnbkrugtli'
        },
    }),
      
     

}
