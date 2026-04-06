USE citywise;

-- Regions
INSERT INTO Regions (RegionCode, RegionName) VALUES
('NA', 'North America'),
('SA', 'South America'),
('EU', 'Europe'),
('AF', 'Africa'),
('AS', 'Asia'),
('OA', 'Oceania');

-- Countries
INSERT INTO Countries (CountryName, RegionID) VALUES
('United States', 1),
('Brazil', 2),
('France', 3),
('Italy', 3),
('South Africa', 4),
('Japan', 5),
('Australia', 6),
('South Korea', 5),
('Egypt', 4),
('Argentina', 2);

-- Cities
INSERT INTO Cities (CityName, CountryID) VALUES
('New York', 1),
('Los Angeles', 1),
('Rio de Janeiro', 2),
('Paris', 3),
('Rome', 4),
('Cape Town', 5),
('Tokyo', 6),
('Sydney', 7),
('Seoul', 8),
('Cairo', 9),
('Buenos Aires', 10);