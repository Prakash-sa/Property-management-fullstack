package repository

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/you/go-clean-realestate/internal/domain"
)

type InMemoryPropertyRepo struct {
	mu   sync.RWMutex
	data map[string]domain.Property
}

func NewInMemoryPropertyRepo() *InMemoryPropertyRepo {
	return &InMemoryPropertyRepo{data: map[string]domain.Property{}}
}

func (r *InMemoryPropertyRepo) List(ctx context.Context) ([]domain.Property, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]domain.Property, 0, len(r.data))
	for _, v := range r.data {
		out = append(out, v)
	}
	return out, nil
}

func (r *InMemoryPropertyRepo) Get(ctx context.Context, id string) (*domain.Property, error) {
	r.mu.RLock(); defer r.mu.RUnlock()
	p, ok := r.data[id]
	if !ok { return nil, errors.New("not found") }
	cp := p
	return &cp, nil
}

func (r *InMemoryPropertyRepo) Create(ctx context.Context, p *domain.Property) error {
	r.mu.Lock(); defer r.mu.Unlock()
	now := time.Now().UTC()
	p.CreatedAt, p.UpdatedAt = now, now
	r.data[p.ID] = *p
	return nil
}

func (r *InMemoryPropertyRepo) Update(ctx context.Context, p *domain.Property) error {
	r.mu.Lock(); defer r.mu.Unlock()
	_, ok := r.data[p.ID]
	if !ok { return errors.New("not found") }
	p.UpdatedAt = time.Now().UTC()
	r.data[p.ID] = *p
	return nil
}

func (r *InMemoryPropertyRepo) Delete(ctx context.Context, id string) error {
	r.mu.Lock(); defer r.mu.Unlock()
	delete(r.data, id)
	return nil
}
