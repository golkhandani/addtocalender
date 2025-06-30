package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type ParseRequest struct {
	Text string `json:"text"`
}

// Groq Request
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqRequest struct {
	Model          string    `json:"model"`
	Messages       []Message `json:"messages"`
	Temperature    float64   `json:"temperature"`
	ResponseFormat struct {
		Type string `json:"type"`
	} `json:"response_format"`
}

type GroqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// Event data

type EventData struct {
	Title     string `json:"title"`
	Location  string `json:"location"`
	Date      string `json:"date"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

func useCors(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "https://addtocalender-1.onrender.com")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler.ServeHTTP(w, r)
	})
}

func main() {
	fmt.Println("Welcome to \"Add To Cal\" backend")
	err := godotenv.Load("/etc/secrets/.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	mux := http.NewServeMux()

	mux.HandleFunc("POST /parse", func(w http.ResponseWriter, r *http.Request) {
		var req ParseRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid input data", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		log.Println("Received Text: " + req.Text)

		prompt := `Extract this OCR text into JSON with fields:
{
  "title": "...",
  "location": "...",
  "date": "...",
  "startTime": "...",
  "endTime": "..."
}
  make sure you only return the json object nothing more
---
` + req.Text

		groqReq := GroqRequest{
			Model: "meta-llama/llama-4-scout-17b-16e-instruct", // or "deepseek-chat"
			Messages: []Message{
				{Role: "user", Content: prompt},
			},
			Temperature: 0,
		}
		groqReq.ResponseFormat.Type = "json_object"

		groqReqBody, _ := json.Marshal(groqReq)
		apiKey := os.Getenv("GROQ_API_KEY")
		groqHttpReq, _ := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(groqReqBody))
		groqHttpReq.Header.Set("Authorization", "Bearer "+apiKey)
		groqHttpReq.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(groqHttpReq)
		if err != nil {
			http.Error(w, "Failed to call Groq", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		var groqResp GroqResponse

		if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
			msg := "Failed to parse Groq response"
			slog.Error(msg, "error", err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}

		defer r.Body.Close()

		content := groqResp.Choices[0].Message.Content

		log.Println("Raw Text: ", content)

		var event EventData
		err = json.Unmarshal([]byte(content), &event)
		if err != nil {
			msg := "Failed to decode event JSON"
			slog.Error(msg, "error", err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		bytes, err := json.Marshal(event)
		if err != nil {
			msg := "Failed to build event JSON"
			slog.Error(msg, "error", err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}
		w.Write(bytes)
	})

	server := useCors(mux)

	http.ListenAndServe(":3001", server)
}
