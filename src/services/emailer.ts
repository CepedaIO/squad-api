import { createTransport } from "nodemailer";

export const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'sharedcepedaio@gmail.com',
    pass: 'czcaivgpvvxexmdp'
  }
});
