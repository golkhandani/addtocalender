package middlewares

import (
	"net/http"
	"os"
)

func UseCors(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		webAddr := "https://addtocal.onrender.com"

		if os.Getenv("APP_ENV") == "dev" {
			webAddr = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", webAddr)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler.ServeHTTP(w, r)
	})
}
