package dtos

type HttpResponseDto[T any] struct {
	Message string `json:"message"`
	Data    []T    `json:"data,omitempty"`
}

type ParseRequest struct {
	Text string `json:"text"`
}

// Event data

type EventData struct {
	Title       string `json:"title"`
	Location    string `json:"location"`
	Description string `json:"description"`
	Date        string `json:"date"`
	StartTime   string `json:"startTime"`
	EndTime     string `json:"endTime"`
}

type EventList struct {
	Events []EventData `json:"events"`
}
