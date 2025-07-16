const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass:  process.env.APP_PASS
  }
});

const sendEmail = async (email,text) =>{
    let mailOptions = {
      from: 'deveshwadibhasme.03@gmail.com',
      to: email || 'deveshwadibhasme.03@gmail.com',
      subject: 'Sell Anything OTP for Register',
      text: text
    };
    
    try {
        await transporter.sendMail(mailOptions);
       return ({success:true});
    } catch (err) {
        console.error('Failed to send email:', err);
       return ({ success:false });
    }
}

module.exports = sendEmail

