package domain

import "time"

type Property struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Address     string    `json:"address"`
	Price       int64     `json:"price"` // cents
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (p *Property) Validate() error {
	if p.Title == "" {
		return ErrValidation("title is required")
	}
	if p.Address == "" {
		return ErrValidation("address is required")
	}
	if p.Price < 0 {
		return ErrValidation("price must be >= 0")
	}
	return nil
}

type ErrValidation string
func (e ErrValidation) Error() string { return string(e) }
