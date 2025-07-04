package utils

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
)

func PasrseWithGroq(text string) (string, error) {
	prompt := AiPrompt + text
	apiKey := os.Getenv("GROQ_API_KEY")

	groqReq := GroqRequest{
		Model: "meta-llama/llama-4-scout-17b-16e-instruct", // or "deepseek-chat"
		Messages: []Message{
			{Role: "user", Content: prompt},
		},
		Temperature: 0,
	}
	groqReq.ResponseFormat.Type = "json_object"

	groqReqBody, _ := json.Marshal(groqReq)

	groqHttpReq, _ := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(groqReqBody))
	groqHttpReq.Header.Set("Authorization", "Bearer "+apiKey)
	groqHttpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(groqHttpReq)
	if err != nil {
		// http.Error(w, "Failed to call Groq", http.StatusInternalServerError)
		return "", err
	}
	defer resp.Body.Close()

	var groqResp GroqResponse

	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		msg := "Failed to parse Groq response"
		slog.Error(msg, "error", err)
		// http.Error(w, msg, http.StatusInternalServerError)
		return "", err
	}

	content := groqResp.Choices[0].Message.Content

	return content, nil
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
