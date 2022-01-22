#!/usr/bin/expect -f

set timeout -1

spawn npx @backstage/create-app

expect "Enter a name for the app"
send -- "backstage-cortex\r"

expect "Select database for the backend"
send -- "\r"

expect eof
