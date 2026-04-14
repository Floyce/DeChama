CREATE TABLE IF NOT EXISTS chama_requests (
    id VARCHAR PRIMARY KEY,
    chama_id VARCHAR REFERENCES chamas(id),
    user_id VARCHAR REFERENCES users(id),
    type VARCHAR NOT NULL,
    amount_sats BIGINT,
    title VARCHAR,
    description VARCHAR,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_chama_requests_id ON chama_requests(id);
CREATE INDEX ix_chama_requests_chama_id ON chama_requests(chama_id);

CREATE TABLE IF NOT EXISTS chama_request_votes (
    id VARCHAR PRIMARY KEY,
    request_id VARCHAR REFERENCES chama_requests(id),
    user_id VARCHAR REFERENCES users(id),
    vote BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_request_user_vote UNIQUE (request_id, user_id)
);

CREATE INDEX ix_chama_request_votes_id ON chama_request_votes(id);
CREATE INDEX ix_chama_request_votes_request_id ON chama_request_votes(request_id);
