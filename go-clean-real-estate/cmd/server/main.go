package main

import (
	"log"
	"net/http"
	"os"

	_ "net/http/pprof"

	"github.com/gorilla/mux"
	"github.com/you/go-clean-realestate/internal/aggregation"
	"github.com/you/go-clean-realestate/internal/infrastructure/db"
	"github.com/you/go-clean-realestate/internal/repository"
	httph "github.com/you/go-clean-realestate/internal/transport/http"
	"github.com/you/go-clean-realestate/internal/transport/ws"
	"github.com/you/go-clean-realestate/internal/usecase"
)

func main() {
	addr := env("ADDR", ":8080")

	// Choose repo: Postgres (prod) or InMemory (dev/tests)
	var repo repository.PropertyRepository
	if os.Getenv("POSTGRES_DSN") != "" {
		sqlDB := db.MustOpen()
		pgRepo, err := repository.NewPGPropertyRepo(sqlDB)
		if err != nil { log.Fatal(err) }
		repo = pgRepo
	} else {
		repo = repository.NewInMemoryPropertyRepo()
	}

	// WS hub for notifications
	hub := ws.NewHub()

	// Usecase layer
	svc := usecase.NewPropertyService(repo, hub)
	agg := aggregation.NewAggregator()

	// HTTP
	r := mux.NewRouter()
	// pprof (perf)
	r.PathPrefix("/debug/pprof/").Handler(http.DefaultServeMux)

	// WebSocket endpoint
	r.HandleFunc("/ws", hub.HandleWS).Methods("GET")

	// Public and protected subrouters
	public := r.NewRoute().Subrouter()
	protected := r.NewRoute().Subrouter()
	protected.Use(httph.JWTMiddleware)

	// Handlers
	h := httph.NewHandler(svc, agg)
	h.Register(public, protected)

	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}

func env(k, d string) string {
	if v := os.Getenv(k); v != "" { return v }
	return d
}
