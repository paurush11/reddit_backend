"use strict";
import nodemailer from "nodemailer";
import { TEST_EMAIL, TEST_PASSWORD } from "../constants";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: TEST_EMAIL,
    pass: TEST_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, text: string) {
  // send mail with defined transport object

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: to, // list of receivers
    subject: "Change Password", // Subject line
    // text, // plain text body
    html: text, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log(nodemailer.getTestMessageUrl(info));
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}
