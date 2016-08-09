# Skeleton Meteor app

Includes configuration for running on Cordova, as well as Spotify OAuth2.

## Setup

1. Install Meteor >1.4 on your machine.
    ```
    curl https://install.meteor.com/ | sh
    ```

    or https://www.meteor.com/install.

2. Create a `settings.json` in the root of the project (this file is gitignored) with this content:

    ```
    {
      "spotify": {
        "clientId": "<the client id>",
        "secret": "<the client secret>"
      }
    }
    ```

Then:

```
npm install # Install dependencies
npm start # Start the Meteor app
# Visit localhost:3000 in browser and login with Spotify!
```
