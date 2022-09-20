import {appConfig} from "./configs/app";
import {createTransport} from "nodemailer";

export const emailer = createTransport({
  service: 'gmail',
  auth: appConfig.emailer
});

export const testEmailer = createTransport({
  host: appConfig.testMailer?.host,
  port: appConfig.testMailer?.port
})

export const providers = {
  emailerFor(to: string) {
    if(appConfig.isDev && appConfig.testUsers.includes(to)) {
      return testEmailer
    }

    return emailer;
  }
}
