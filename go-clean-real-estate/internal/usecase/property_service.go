package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/you/go-clean-realestate/internal/domain"
	"github.com/you/go-clean-realestate/internal/repository"
)

type Notifier interface {
	BroadcastPriceUpdate(propertyID string, newPrice int64)
}

type PropertyService struct {
	repo      repository.PropertyRepository
	notifier  Notifier // decoupled; ws hub implements
}

func NewPropertyService(repo repository.PropertyRepository, n Notifier) *PropertyService {
	return &PropertyService{repo: repo, notifier: n}
}

func (s *PropertyService) List(ctx context.Context) ([]domain.Property, error) {
	return s.repo.List(ctx)
}

func (s *PropertyService) Create(ctx context.Context, p *domain.Property) (*domain.Property, error) {
	if err := p.Validate(); err != nil { return nil, err }
	if p.ID == "" { p.ID = uuid.NewString() }
	if err := s.repo.Create(ctx, p); err != nil { return nil, err }
	if s.notifier != nil { s.notifier.BroadcastPriceUpdate(p.ID, p.Price) }
	return p, nil
}

func (s *PropertyService) Update(ctx context.Context, p *domain.Property) (*domain.Property, error) {
	if p.ID == "" { return nil, errors.New("id required") }
	if err := p.Validate(); err != nil { return nil, err }
	if err := s.repo.Update(ctx, p); err != nil { return nil, err }
	if s.notifier != nil { s.notifier.BroadcastPriceUpdate(p.ID, p.Price) }
	return p, nil
}

func (s *PropertyService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *PropertyService) Get(ctx context.Context, id string) (*domain.Property, error) {
	return s.repo.Get(ctx, id)
}
