-- Seed script for match-journal database
-- Insertar equipos
INSERT OR IGNORE INTO Team (id, name, logoUrl, createdAt, updatedAt) VALUES
('chivas', 'Chivas', '/images/logos/chivas.webp', datetime('now'), datetime('now')),
('chivas_femenil', 'Chivas Femenil', '/images/logos/chivas.webp', datetime('now'), datetime('now')),
('atlas', 'Atlas', '/images/logos/atlas.webp', datetime('now'), datetime('now')),
('atletico_de_san_luis_femenil', 'Atlético de San Luis Femenil', '/images/logos/atletico_san_luis.webp', datetime('now'), datetime('now')),
('atletico_de_san_luis', 'Atlético de San Luis', '/images/logos/atletico_san_luis.webp', datetime('now'), datetime('now')),
('pachuca', 'Pachuca', '/images/logos/pachuca.webp', datetime('now'), datetime('now')),
('pachuca_femenil', 'Pachuca Femenil', '/images/logos/pachuca.webp', datetime('now'), datetime('now'));

-- Insertar competiciones
INSERT OR IGNORE INTO Competition (id, name, country, createdAt, updatedAt) VALUES
('liga_mx', 'Liga MX', 'México', datetime('now'), datetime('now')),
('liga_mx_femenil', 'Liga MX Femenil', 'México', datetime('now'), datetime('now')),
('amistosos', 'Amistosos', 'General', datetime('now'), datetime('now'));

-- Insertar estadios
INSERT OR IGNORE INTO Stadium (id, name, city, country, imageUrl, createdAt, updatedAt) VALUES
('akron', 'Estadio Akron', 'Guadalajara', 'México', '/images/stadiums/akron.webp', datetime('now'), datetime('now')),
('jalisco', 'Estadio Jalisco', 'Guadalajara', 'México', '/images/stadiums/jalisco.webp', datetime('now'), datetime('now')),
('azteca', 'Estadio Azteca', 'Ciudad de México', 'México', '/images/stadiums/azteca.webp', datetime('now'), datetime('now'));
