SELECT nome, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
FROM ligas
GROUP BY nome
HAVING COUNT(*) > 1;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_liga_ano' AND table_name = 'temporadas') THEN
        ALTER TABLE temporadas DROP CONSTRAINT unique_liga_ano;
    END IF;
END $$;

WITH mapeamento AS (
    SELECT l1.id AS id_correto, l2.id AS id_duplicado
    FROM ligas l1
    JOIN ligas l2 ON l1.nome = l2.nome AND l1.id < l2.id
)
UPDATE temporadas
SET liga_id = mapeamento.id_correto
FROM mapeamento
WHERE temporadas.liga_id = mapeamento.id_duplicado;


DELETE FROM ligas
WHERE id IN (
    SELECT l.id
    FROM ligas l
    LEFT JOIN (
        SELECT MIN(id) AS id_correto
        FROM ligas
        GROUP BY nome
    ) AS unicos ON l.id = unicos.id_correto
    WHERE unicos.id_correto IS NULL
);
