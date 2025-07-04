package utils

import (
	"log"
	"os"
)

func LogDev(msg string) {
	if os.Getenv("APP_ENV") == DEVELOPMENT {
		log.Println(msg)
	}
}
