package http

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

type ctxKey string
const ctxUserID ctxKey = "userID"

func issueJWT(userID string) (string, error) {
	secret := []byte(os.Getenv("JWT_SECRET"))
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(secret)
}

func JWTMiddleware(next http.Handler) http.Handler {
	secret := []byte(os.Getenv("JWT_SECRET"))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := r.Header.Get("Authorization")
		if !strings.HasPrefix(h, "Bearer ") {
			http.Error(w, "missing bearer token", http.StatusUnauthorized); return
		}
		tok := strings.TrimPrefix(h, "Bearer ")
		parsed, err := jwt.Parse(tok, func(t *jwt.Token) (any, error) { return secret, nil })
		if err != nil || !parsed.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized); return
		}
		claims, ok := parsed.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "invalid claims", http.StatusUnauthorized); return
		}
		sub, _ := claims["sub"].(string)
		ctx := context.WithValue(r.Context(), ctxUserID, sub)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
