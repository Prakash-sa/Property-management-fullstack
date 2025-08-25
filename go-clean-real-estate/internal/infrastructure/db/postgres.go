package db

import (
	"database/sql"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
)

func MustOpen() *sql.DB {
	dsn := os.Getenv("POSTGRES_DSN") // e.g. postgres://user:pass@localhost:5432/realestate?sslmode=disable
	if dsn == "" { panic("POSTGRES_DSN not set") }
	db, err := sql.Open("postgres", dsn)
	if err != nil { panic(err) }

	// Connection pooling
	db.SetMaxOpenConns(envInt("DB_MAX_OPEN", 25))
	db.SetMaxIdleConns(envInt("DB_MAX_IDLE", 25))
	db.SetConnMaxLifetime(time.Minute * 30)

	if err = db.Ping(); err != nil { panic(err) }
	return db
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil { return i }
	}
	return def
}
