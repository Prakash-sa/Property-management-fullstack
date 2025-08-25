package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/you/go-clean-realestate/internal/domain"
)

type PGPropertyRepo struct {
	db *sql.DB

	stmtList   *sql.Stmt
	stmtGet    *sql.Stmt
	stmtCreate *sql.Stmt
	stmtUpdate *sql.Stmt
	stmtDelete *sql.Stmt
}

func NewPGPropertyRepo(db *sql.DB) (*PGPropertyRepo, error) {
	r := &PGPropertyRepo{db: db}
	var err error

	// Prepared statements (help latency & plan caching)
	if r.stmtList, err = db.Prepare(`SELECT id, title, address, price, description, created_at, updated_at FROM properties ORDER BY created_at DESC`); err != nil { return nil, err }
	if r.stmtGet, err = db.Prepare(`SELECT id, title, address, price, description, created_at, updated_at FROM properties WHERE id=$1`); err != nil { return nil, err }
	if r.stmtCreate, err = db.Prepare(`INSERT INTO properties (id, title, address, price, description, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`); err != nil { return nil, err }
	if r.stmtUpdate, err = db.Prepare(`UPDATE properties SET title=$2,address=$3,price=$4,description=$5,updated_at=$6 WHERE id=$1`); err != nil { return nil, err }
	if r.stmtDelete, err = db.Prepare(`DELETE FROM properties WHERE id=$1`); err != nil { return nil, err }

	return r, nil
}

func (r *PGPropertyRepo) List(ctx context.Context) ([]domain.Property, error) {
	rows, err := r.stmtList.QueryContext(ctx); if err != nil { return nil, err }
	defer rows.Close()
	var out []domain.Property
	for rows.Next() {
		var p domain.Property
		if err := rows.Scan(&p.ID,&p.Title,&p.Address,&p.Price,&p.Description,&p.CreatedAt,&p.UpdatedAt); err != nil { return nil, err }
		out = append(out, p)
	}
	return out, rows.Err()
}

func (r *PGPropertyRepo) Get(ctx context.Context, id string) (*domain.Property, error) {
	var p domain.Property
	err := r.stmtGet.QueryRowContext(ctx, id).Scan(&p.ID,&p.Title,&p.Address,&p.Price,&p.Description,&p.CreatedAt,&p.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) { return nil, errors.New("not found") }
	if err != nil { return nil, err }
	return &p, nil
}

func (r *PGPropertyRepo) Create(ctx context.Context, p *domain.Property) error {
	now := time.Now().UTC()
	p.CreatedAt, p.UpdatedAt = now, now
	_, err := r.stmtCreate.ExecContext(ctx, p.ID,p.Title,p.Address,p.Price,p.Description,p.CreatedAt,p.UpdatedAt)
	return err
}

func (r *PGPropertyRepo) Update(ctx context.Context, p *domain.Property) error {
	p.UpdatedAt = time.Now().UTC()
	res, err := r.stmtUpdate.ExecContext(ctx, p.ID,p.Title,p.Address,p.Price,p.Description,p.UpdatedAt)
	if err != nil { return err }
	aff, _ := res.RowsAffected()
	if aff == 0 { return errors.New("not found") }
	return nil
}

func (r *PGPropertyRepo) Delete(ctx context.Context, id string) error {
	_, err := r.stmtDelete.ExecContext(ctx, id)
	return err
}
