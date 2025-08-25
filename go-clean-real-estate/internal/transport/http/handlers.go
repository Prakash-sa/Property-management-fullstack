package http

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/you/go-clean-realestate/internal/aggregation"
	"github.com/you/go-clean-realestate/internal/domain"
	"github.com/you/go-clean-realestate/internal/usecase"
)

type Handler struct {
	svc        *usecase.PropertyService
	aggregator *aggregation.Aggregator
}

func NewHandler(svc *usecase.PropertyService, ag *aggregation.Aggregator) *Handler {
	return &Handler{svc: svc, aggregator: ag}
}

func (h *Handler) Register(r *mux.Router, protected *mux.Router) {
	// Auth
	r.HandleFunc("/login", h.login).Methods("POST")

	// CRUD (protected)
	protected.HandleFunc("/properties", h.list).Methods("GET")
	protected.HandleFunc("/properties", h.create).Methods("POST")
	protected.HandleFunc("/properties/{id}", h.update).Methods("PUT")
	protected.HandleFunc("/properties/{id}", h.delete).Methods("DELETE")
	protected.HandleFunc("/properties/{id}", h.get).Methods("GET")

	// concurrent aggregation
	protected.HandleFunc("/properties/{id}/prices", h.aggregatePrices).Methods("GET")
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	// In real life: validate user/pass against DB/IdP
	type req struct{ User string `json:"user"` }
	var body req
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.User == "" { body.User = "demo-user" }
	tok, err := issueJWT(body.User)
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	writeJSON(w, http.StatusOK, map[string]string{"token": tok})
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	props, err := h.svc.List(r.Context())
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	writeJSON(w, http.StatusOK, props)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	p, err := h.svc.Get(r.Context(), id)
	if err != nil { http.Error(w, "not found", http.StatusNotFound); return }
	writeJSON(w, http.StatusOK, p)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var p domain.Property
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest); return
	}
	created, err := h.svc.Create(r.Context(), &p)
	if err != nil { http.Error(w, err.Error(), http.StatusBadRequest); return }
	writeJSON(w, http.StatusCreated, created)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var p domain.Property
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest); return
	}
	p.ID = id
	updated, err := h.svc.Update(r.Context(), &p)
	if err != nil { http.Error(w, err.Error(), http.StatusBadRequest); return }
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.svc.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError); return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) aggregatePrices(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	urls := []string{
		"http://api1/prices?id="+id,
		"http://api2/prices?id="+id,
		"http://api3/prices?id="+id,
	}
	resp := h.aggregator.FetchAndMerge(ctx, urls)
	writeJSON(w, http.StatusOK, resp)
}
