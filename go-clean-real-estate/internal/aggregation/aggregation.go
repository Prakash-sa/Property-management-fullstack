package aggregation

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

type Price struct {
	Source string `json:"source"`
	Amount int64  `json:"amount"` // cents
}

type Merged struct {
	Best     *Price   `json:"best,omitempty"`
	All      []Price  `json:"all"`
	Received int      `json:"received"`
	Failed   int      `json:"failed"`
	Latency  string   `json:"latency"`
}

type Aggregator struct {
	http *http.Client
}

func NewAggregator() *Aggregator {
	return &Aggregator{http: &http.Client{Timeout: 2 * time.Second}}
}

func (a *Aggregator) FetchAndMerge(ctx context.Context, urls []string) Merged {
	start := time.Now()
	type res struct {
		p   *Price
		err error
	}
	ch := make(chan res, len(urls))
	var wg sync.WaitGroup
	wg.Add(len(urls))

	for _, u := range urls {
		go func(url string) {
			defer wg.Done()
			req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
			resp, err := a.http.Do(req)
			if err != nil {
				ch <- res{nil, err}; return
			}
			defer resp.Body.Close()
			var p Price
			if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
				ch <- res{nil, err}; return
			}
			ch <- res{&p, nil}
		}(u)
	}

	wg.Wait()
	close(ch)

	out := Merged{All: make([]Price, 0, len(urls))}
	for r := range ch {
		if r.err != nil { out.Failed++; continue }
		out.All = append(out.All, *r.p)
		out.Received++
		if out.Best == nil || r.p.Amount < out.Best.Amount {
			cp := *r.p
			out.Best = &cp
		}
	}
	out.Latency = time.Since(start).String()
	return out
}
