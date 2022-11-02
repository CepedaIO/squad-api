import {Duration} from "luxon";
import {LoginTokenEntity} from "../entities/LoginTokenEntity";
import {URL} from "url";
import {appConfig} from "../configs/app";
import {join} from "path";
import {InviteToken} from "../entities/InviteToken";
import {Service} from "typedi";

@Service()
export class HTMLService {
  private blue = '#3b83f6';
  private red = '#fb7186'
  private acceptBtn = `background-color:${this.blue};color:white;width:165px;height:40px;cursor:pointer;border:0;`;
  private rejectBtn = `background-color:${this.red};color:white;width:165px;height:40px;cursor:pointer;border:0;`;
  private horizontalItem = 'margin-bottom:10px;display:inline-block';

  login(login: LoginTokenEntity) {
    const url = new URL(appConfig.clientURL)
    url.pathname = join('login-with', login.uuid, login.key);
    const link = url.toString();

    return `
<html>
  <body>
    <h1>Welcome to Squad!</h1>
    
    <p>
      If you have any questions or run into any bugs, reach out to <a style="color:${this.blue};text-decoration:underline;cursor:pointer" href = "mailto:support@cepeda.io">support@cepeda.io</a>
    </p>
    <p>
      How would you like to log in?
    </p>
    <ul style="list-style: none">
      <li style="${this.horizontalItem}">
        <a href="${link}?expires=0">
          <button style="${this.acceptBtn}">Expire after 1 hour</button>
        </a>
      </li>
      <li style="${this.horizontalItem}">
        <a href="${link}?expires=1">
          <button style="${this.acceptBtn}">Expire after 2 weeks</button>
        </a>
      </li>
      <li style="${this.horizontalItem}">
        <a href="${link}?reject=true">
          <button style="${this.rejectBtn}">Don't Login</button>
        </a>
      </li>
    </ul>
  </body>
</html>`
  }

  invite(invite: InviteToken, from:string, message: string) {
    const url = new URL(appConfig.clientURL)
    const event = invite.event;
    url.pathname = join('event', event.id.toString(), 'invite', invite.uuid, invite.key);
    const link = url.toString();

    return `
<html>
  <body>
    <h1>${event.name}</h1>
    
    <h4>From ${from}:</h4>
    <p>${message}</p>
    
    <h4>Description:</h4>
    <p>${event.description}</p>
    
    <h4>Duration:</h4>
    <span>${Duration.fromDurationLike(event.duration).toHuman()}</span>
    
    <p>Would you like to join this event?</p>
    <ul style="list-style: none">
      <li style="${this.horizontalItem}">
        <a href="${link}">
          <button style="${this.acceptBtn}">Accept</button>
        </a>
      </li>
      <li style="${this.horizontalItem}">
        <a href="${link}?reject=true">
          <button style="${this.rejectBtn}">Don't Join</button>
        </a>
      </li>
    </ul>
  </body>
</html>`
  }
}
