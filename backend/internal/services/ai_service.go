package services

type AIResponse struct {
	Summary string                 `json:"summary"`
	Data    map[string]interface{} `json:"data"`
}

func QueryAI(prompt string) (AIResponse, error) {
	// MOCKED RESPONSE
	// We simulate processing the natural language prompt and returning a response.
	return AIResponse{
		Summary: "Based on your prompt, here is a summary of the traffic trends from the requested period. We noticed a 15% increase in unique visitors compared to the previous week.",
		Data: map[string]interface{}{
			"visitors": 12450,
			"pageviews": 45000,
			"trend": "upward",
		},
	}, nil
}
