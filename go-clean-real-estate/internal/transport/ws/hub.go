package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]struct{}
	upgrader websocket.Upgrader
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[*websocket.Conn]struct{}),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool { return true }, // adjust CORS for prod
		},
	}
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil { http.Error(w, err.Error(), http.StatusBadRequest); return }
	h.mu.Lock(); h.clients[conn] = struct{}{}; h.mu.Unlock()

	go func(c *websocket.Conn) {
		defer func() {
			h.mu.Lock(); delete(h.clients, c); h.mu.Unlock()
			_ = c.Close()
		}()
		for {
			if _, _, err := c.ReadMessage(); err != nil {
				return
			}
		}
	}(conn)
}

func (h *Hub) BroadcastPriceUpdate(propertyID string, newPrice int64) {
	h.mu.RLock(); defer h.mu.RUnlock()
	msg := map[string]any{"type":"price_update","propertyId":propertyID,"newPrice":newPrice}
	for c := range h.clients {
		if err := c.WriteJSON(msg); err != nil {
			log.Printf("ws write error: %v", err)
		}
	}
}
