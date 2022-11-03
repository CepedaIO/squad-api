# Squad API

## Setup

### Minimal .env values

```dotenv
JWT_SECRET=<any 16+ character string>
SMTP_HOST=<localhost || host.docker.internal>
SMTP_PORT=7777
NO_REPLY_ADDRESS=<Set up with gmail>
EMAILER_USER=<Set up with gmail>
EMAILER_PASS=<Set up with gmail>
```

### How to setup gmail email for testing

If you want to test the application outside of Cypress you will either have to create and manage your own SMTP server (which Cypress does for you)

Or you will have to Gmail as a provider by creating an application password and use your email or an email alias

#### How to set up gmail application password

First you need an application password for your gmail
https://support.google.com/mail/answer/185833?hl=en-GB

#### How to set up email alias

If you don't want to use your person email, you can set up an alias using the application password above
https://support.google.com/mail/answer/22370

## Working locally

When working locally, you have to link the `shared` library with the server to get the most up to date version

```bash
cd ./services/shared
yarn link
cd ./services/api
yarn link "squad-shared"
```


