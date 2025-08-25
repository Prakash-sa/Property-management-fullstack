package tests

import (
	"context"
	"testing"

	"github.com/you/go-clean-realestate/internal/domain"
	"github.com/you/go-clean-realestate/internal/repository"
	"github.com/you/go-clean-realestate/internal/usecase"
)

type noopNotifier struct{}
func (noopNotifier) BroadcastPriceUpdate(string, int64) {}

func TestPropertyCRUD(t *testing.T) {
	repo := repository.NewInMemoryPropertyRepo()
	svc := usecase.NewPropertyService(repo, noopNotifier{})

	// Create
	p, err := svc.Create(context.Background(), &domain.Property{
		Title: "Cozy Apt", Address: "123 Ave", Price: 25000000,
	})
	if err != nil { t.Fatal(err) }
	if p.ID == "" { t.Fatal("expected id") }

	// Get
	got, err := svc.Get(context.Background(), p.ID)
	if err != nil { t.Fatal(err) }
	if got.Title != "Cozy Apt" { t.Fatalf("got %s", got.Title) }

	// Update
	got.Price = 26000000
	_, err = svc.Update(context.Background(), got)
	if err != nil { t.Fatal(err) }

	// List
	all, err := svc.List(context.Background())
	if err != nil || len(all) != 1 { t.Fatalf("list len=%d err=%v", len(all), err) }

	// Delete
	if err := svc.Delete(context.Background(), p.ID); err != nil { t.Fatal(err) }
}
