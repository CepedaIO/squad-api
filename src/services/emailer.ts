import { createTransport } from "nodemailer";
import {appConfig} from "../configs/app";

export const transporter = createTransport({
  service: 'gmail',
  auth: appConfig.emailer
});
