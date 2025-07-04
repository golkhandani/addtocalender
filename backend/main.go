package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/golkhandani/addtocal/controllers"
	"github.com/golkhandani/addtocal/middlewares"
	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Welcome to \"Add To Cal\" backend")
	err := godotenv.Load("/etc/secrets/.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		os.Setenv("APP_ENV", "dev")
	}
	fmt.Printf("APP_ENV: %v\n", os.Getenv("APP_ENV"))

	mux := http.NewServeMux()
	controllers.RegisterWakeupController(mux)
	controllers.RegisterParserController(mux)

	server := middlewares.UseCors(mux)
	http.ListenAndServe(":3001", server)
	fmt.Println("Server is up and running on 3001")
}
