import { createTransport } from "nodemailer";
import {appConfig} from "../configs/app";

/*
console.log("emailer:", appConfig.emailer);
export const transporter = createTransport({
  service: 'gmail',
  auth: appConfig.emailer
});*/

console.log('test-emailer:', appConfig.testMailer);
export const transporter = createTransport({
  host: appConfig.testMailer.host,
  port: appConfig.testMailer.port
})
