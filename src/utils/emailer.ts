import { createTransport } from "nodemailer";
import {appConfig} from "../configs/app";

export const emailer = createTransport({
  service: 'gmail',
  auth: appConfig.emailer
});

export const testEmailer = createTransport({
  host: appConfig.testMailer.host,
  port: appConfig.testMailer.port
})
