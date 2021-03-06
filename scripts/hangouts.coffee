# Taken originally from:
# https://raw.githubusercontent.com/nprapps/totebot2/master/scripts/hangouts.coffee
#
# Description:
#   Create hangouts with Hubot.
#
# Commands:
#   hubot hangout <title> - Creates a Hangout with the given title and returns the URL.
#
# Notes:
#   Yep, this is a pretty big hack. Nope, I couldn't figure out a better way.
#
#   We use the Google Calendar API to generate hangout links, so whichever user
#   was logged in when REFRESH_TOKEN was generated will get events added to
#   their calendar.
#
#   You may specify a calendar other than the user's primary calendar by
#   setting HUBOT_GOOGLE_CALENDAR_ID. The Calendar ID can be retrieved in
#   Google Calendar's Settings in the "Calendar Address" row when viewing
#   details for an individual calendar. It looks something like
#   "example.com_abc123@group.calendar.google.com".
#
#   The user's calendar must have "Automatically add video calls to events
#   I create" enabled in Google Calendar's Settings.
#
# Configuration:
#   HUBOT_GOOGLE_CALENDAR_CLIENT_ID and
#   HUBOT_GOOGLE_CALENDAR_CLIENT_SECRET are generated by creating a new
#   application on the on the Google APIs Console:
#   <https://code.google.com/apis/console>.
#   - Click "API and Auth" followed by "API" turn on the "Calendar API".
#   - Then click "Consent screen", "Oauth", and "Web application"
#   - Be sure to select your email address or the heroku app can't authenticate
#    against it.
#   - Be sure to use this as the redirect URI, assuming you are using this
#    heroku app to creaet a token:
#    https://google-oauth2.herokuapp.com/oauth2callback
#
#   HUBOT_GOOGLE_CALENDAR_REFRESH_TOKEN is an OAuth2 refresh token with
#   authorization to create events on your user's calendar. An easy way to get
#   ahold of such a token is to specify the redirect URI for your app as
#   <https://google-oauth2.herokuapp.com/oauth2callback> on the Google APIs
#   Console. This small Heroku app will run through the Google OAuth2
#   authorization flow and spit out a refresh token for you to use. It'll only
#   be authorized to interact with your calendar.
#
#   After creating your client ID and client secret, navigate to
#   <https://google-oauth2.herokuapp.com>, specify
#   <https://www.googleapis.com/auth/calendar> as the scope, and click
#   "Authorize!" If everything is successful, you'll be presented with a
#   refresh token at the end.
#
#   If you specify a different redirect URI, set the
#   HUBOT_GOOGLE_CALENDAR_REDIRECT_URI environment variable too.
#
# Author:
#   alindeman
#   https://github.com/hubot-scripts/hubot-google-hangouts/

calendarClientId     = process.env.HUBOT_GOOGLE_CALENDAR_CLIENT_ID
calendarClientSecret = process.env.HUBOT_GOOGLE_CALENDAR_CLIENT_SECRET
calendarRefreshToken = process.env.HUBOT_GOOGLE_CALENDAR_REFRESH_TOKEN
calendarRedirectUri  = process.env.HUBOT_GOOGLE_CALENDAR_REDIRECT_URI ? "https://google-oauth2.herokuapp.com/oauth2callback"
calendarId           = process.env.HUBOT_GOOGLE_CALENDAR_ID ? "primary"
calendarEventLength  = (1000 * 60 * 60) * 3 # hours

googleapis = require('googleapis')


module.exports = (robot) ->
  robot.respond /\s*(.+)? (\bhangout)( me)?\s*(.+)?/i, (msg) ->
    summary     = msg.match[4] or "Hangout"
    description = "Requested by #{msg.message.user.name} in #{msg.message.user.room}"

    createCalendarEvent msg, summary, description, (err, event) ->
      if err
        msg.send "I'm sorry. Something went wrong and I wasn't able to create a hangout :("
      else
        response  = "I've started a hangout titled '#{summary}'\n"
        response += "#{event.hangoutLink}"
        msg.send response


  createCalendarEvent = (msg, summary, description, callback) ->
    withGoogleClient msg, (client, auth) ->
      req = client.calendar.events.insert { calendarId: calendarId },
        summary: "Google Hangout: #{summary}"
        description: description
        reminders:
          overrides:
            method: 'popup'
            minutes: 0
        start:
          dateTime: new Date().toISOString()
        end:
          dateTime: new Date(+new Date() + calendarEventLength).toISOString()

      req.withAuthClient(auth).execute(callback)


  googleClient = undefined
  authClient = undefined


  withGoogleClient = (msg, callback) ->
    if googleClient?
      callback(googleClient, authClient)
    else
      return if missingEnvironmentForApi(msg)
      googleapis.discover('calendar', 'v3').execute (err, client) ->
        if err
          msg.send "I'm sorry. I wasn't able to communicate with Google right now :("
        else
          authClient = new googleapis.OAuth2Client(
            calendarClientId, calendarClientSecret, calendarRedirectUri
          )
          authClient.credentials = { refresh_token: calendarRefreshToken }

          googleClient = client
          callback(googleClient, authClient)


  missingEnvironmentForApi = (msg) ->
    missingAnything = false
    unless calendarClientId?
      msg.send "Calendar Client ID is missing: Ensure that HUBOT_GOOGLE_CALENDAR_CLIENT_ID is set."
      missingAnything = true
    unless calendarClientSecret?
      msg.send "Calendar Client Secret is missing: Ensure that HUBOT_GOOGLE_CALENDAR_CLIENT_SECRET is set."
      missingAnything = true
    unless calendarRefreshToken?
      msg.send "Calendar Refresh Token is missing: Ensure that HUBOT_GOOGLE_CALENDAR_REFRESH_TOKEN is set."
      missingAnything = true
    missingAnything
