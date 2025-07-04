package controllers

import (
	"encoding/json"
	"log"
	"log/slog"
	"net/http"

	"github.com/golkhandani/addtocal/dtos"
	"github.com/golkhandani/addtocal/utils"
)

func RegisterParserController(mux *http.ServeMux) {
	mux.HandleFunc("POST /parse", func(w http.ResponseWriter, r *http.Request) {
		var req dtos.ParseRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid input data", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		utils.LogDev("Received Text: " + req.Text)

		content, err := utils.PasrseWithGroq(req.Text)
		if err != nil {
			http.Error(w, "Failed to parse text", http.StatusBadRequest)
			return
		}

		log.Println("Raw Text: ", content)

		var events dtos.EventList
		err = json.Unmarshal([]byte(content), &events)
		if err != nil {
			msg := "Failed to decode event JSON"
			slog.Error(msg, "error", err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		bytes, err := json.Marshal(dtos.HttpResponseDto[dtos.EventData]{
			Data:    events.Events,
			Message: "Success",
		})
		if err != nil {
			msg := "Failed to build event JSON"
			slog.Error(msg, "error", err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}

		w.Write(bytes)
	})
}
