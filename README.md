# NotoriousBOT

Notorious B.O.T. is a chat bot built on the [Hubot](https://hubot.github.com/hubot) framework. It was initially generated by `generator-hubot`, and configured to be deployed on [Heroku](http://heroku.com/).

## Scripting (plugins)

### NPM and external scripts

There is a [Hubot Scripts org](https://github.com/hubot-scripts) with tons of existing scripts.

1. Install with npm: `npm install hubot-shipit --save`
1. Add `"hubot-shipit"` to the array in `external-scripts.json`

### Writing your own

Custom scripts go in the `scripts` folder.  They don't have to be written in CoffeeScript.  An example script is included at `scripts/example.coffee`, so check it out to get started, along with the [Scripting Guide](https://github.com/github/hubot/blob/master/docs/scripting.md).

1. Write new script, such as `scripts/awesome.coffee`
1. Add `awesome` to `hubot-scripts.json` ??

## Configure

The following environmental variables are needed.  These should already be installed on Heroku, and some you don't need locally, depending on what you are testing.

1. `export REDISTOGO_URL=XXX`
    * Redis backend so that the bot remembers things.  Heroku add-on.
1. `export HUBOT_SLACK_TOKEN=XXXX`
    * Slack API token.  Found at the [Slack Hubot config page](https://datanews.slack.com/services/3859529060).
1. `export HEROKU_URL=http://notoriousbot.herokuapp.com/`
    * So the bot knows where to talk to.
1. `export HUBOT_HEROKU_KEEPALIVE_URL=$(heroku apps:info -s  | grep web_url | cut -d= -f2)`
    * A simple mechanism so Heroku doesn't go to sleep
1. `export HUBOT_GOOGLE_CALENDAR_ID=XXXX && export HUBOT_GOOGLE_CALENDAR_CLIENT_ID=XXXX && export HUBOT_GOOGLE_CALENDAR_CLIENT_SECRET=XXXX && export HUBOT_GOOGLE_CALENDAR_REFRESH_TOKEN=XXXX`
    * Config for Hangouts scripts.  See `hangouts.coffee` for details.
1. For Chartbeat integration:
    * Default site: `export HUBOT_CHARTBEAT_SITE=example.com`
    * All available sites `export HUBOT_CHARTBEAT_SITES=example1.com,example2.com`
    * API key: `export HUBOT_CHARTBEAT_API_KEY=XXXXXXXXXXXXXXXX`
1. Calculon (Spark Core) integration:
    * Spark Core device ID: `export CALCULON_DEVICE_ID=XXXXXX`
    * Access token is with the account that has claimed the device: `export CALCULON_ACCESS_TOKEN=XXXXXX`
    * API key for Forecast.io for checking current weather temp: `export CALCULON_FORECAST_IO_KEY=XXXX`
    * Location to look for temperature: `export CALCULON_LOCATION=12.345,67.890`


## Running locally

You can start NotoriousBOT locally by running:

    bin/hubot -n NotoriousBOT
    OR
    npm run local

You'll see some start up output about where your scripts come from and a
prompt:

    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading adapter shell
    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading scripts from /home/tomb/Development/hubot/scripts
    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading scripts from /home/tomb/Development/hubot/src/scripts
    Hubot>

Then you can interact with NotoriousBOT by typing `NotoriousBOT help`.

    NotoriousBOT> NotoriousBOT help

    NotoriousBOT> animate me <query> - The same thing as `image me`, except adds a few
    convert me <expression> to <units> - Convert expression to given units.
    help - Displays all of the help commands that Hubot knows about.
    ...

## Deployment

This should already be done

    heroku create --stack cedar
    git push heroku master
    heroku addons:add redistogo:nano

Add the environment variables (see Configuration above) to Heroku

    heroku config:set HEROKU_URL=XXXX

### Updating

If adding new scripts with new configuration, you will need to send to Heroku.

    heroku config:set NEWTHING=XXXXXX
    heroku config:set HUBOT_HEROKU_KEEPALIVE_URL=$(heroku apps:info -s  | grep web_url | cut -d= -f2)
    heroku restart
