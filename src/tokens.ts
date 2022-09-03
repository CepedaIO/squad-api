import {Token} from "typedi";
import {EntityManager} from "typeorm";
import {Transporter} from "nodemailer";

export const tokens = {
  Emailer: new Token<Transporter>(),
  EntityManager: new Token<EntityManager>(),
  RequestId: new Token<string>()
}
