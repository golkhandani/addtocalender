package controllers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/golkhandani/addtocal/dtos"
	"github.com/golkhandani/addtocal/utils"
)

func RegisterWakeupController(mux *http.ServeMux) {
	mux.HandleFunc("GET /wakeup", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		bytes, err := json.Marshal(dtos.HttpResponseDto[struct{}]{
			Message: "WokeUp",
		})
		utils.LogDev("System is awaken!")
		if err != nil {
			msg := "Failed to build event JSON"
			slog.Error(msg, "error", err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}
		w.Write(bytes)
	})
}
