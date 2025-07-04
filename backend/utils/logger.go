package utils

import (
	"log"
	"os"
)

func LogDev(msg string) {
	if os.Getenv("GO_ENV") == DEVELOPMENT {
		log.Println(msg)
	}
}
