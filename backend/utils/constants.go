package utils

import (
	"strconv"
	"time"
)

const (
	DEVELOPMENT = "dev"
	PRODUCTION  = "prod"
)

var AiPrompt = `Extract this OCR text into JSON ARRAY with fields:
{
  "title": "...", -> it should be string -> with default "event"
  "location": "...", -> it should be string -> with default ""
  "description" "...", -> it should be string -> with default ""
  "date": "...", -> it should be string like 'june/12/2025' -> with default ""
  "startTime": "...", -> it should be string like '11:23 am' -> with default "12:00 am"
  "endTime": "..." -> it should be string like '11:23 am' -> with default "11:59 pm"
}
  Make sure you only return the json object nothing more
  - each date should have it's own event object inside the array
  - title should have correct spacing between words
  - location should be the same for all of them if nothing has been specified
  - times should have am/pm
  - description should have any detail related to the event like any other text in the page like title, or footer,...
  - description should be the same for all of them if nothing has been specified
  - date should have month/day/year -> if there was no year for date use` + strconv.Itoa(time.Now().Year()) + `as year, month should be the name of the month and day should be a valid day of the month
  - if you could not extract the exact date and time use your best guess
  
  - note: most of the time dates are before title like July 3 Bring it on -> july 3 is the date and bring it on is title
  -- if you saw the name of the month the next item would be the day by a great chance if it's similar to s probably it is 5


  - remove the items where date is empty from the return array
---
`
