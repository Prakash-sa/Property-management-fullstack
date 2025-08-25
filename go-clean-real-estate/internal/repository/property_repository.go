package repository

import (
	"context"
	"github.com/you/go-clean-realestate/internal/domain"
)

type PropertyRepository interface {
	List(ctx context.Context) ([]domain.Property, error)
	Get(ctx context.Context, id string) (*domain.Property, error)
	Create(ctx context.Context, p *domain.Property) error
	Update(ctx context.Context, p *domain.Property) error
	Delete(ctx context.Context, id string) error
}
