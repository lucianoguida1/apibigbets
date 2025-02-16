SELECT liga_id,ano, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
FROM temporadas
GROUP BY liga_id,ano
HAVING COUNT(*) > 1;

WITH duplicados AS (
    SELECT liga_id, ano, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
    FROM temporadas
    GROUP BY liga_id, ano
    HAVING COUNT(*) > 1
)
UPDATE jogos
SET temporada_id = duplicados.id_correto
FROM duplicados
WHERE jogos.temporada_id = ANY(duplicados.ids_duplicados)
AND jogos.temporada_id <> duplicados.id_correto;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_temporada_time' 
        AND table_name = 'timestemporadas'
    ) THEN
        ALTER TABLE timestemporadas DROP CONSTRAINT unique_temporada_time;
    END IF;
END $$;

WITH duplicados AS (
    SELECT liga_id, ano, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
    FROM temporadas
    GROUP BY liga_id, ano
    HAVING COUNT(*) > 1
)
UPDATE timestemporadas
SET temporada_id = duplicados.id_correto
FROM duplicados
WHERE timestemporadas.temporada_id = ANY(duplicados.ids_duplicados)
AND timestemporadas.temporada_id <> duplicados.id_correto;

WITH duplicados AS (
    SELECT liga_id, ano, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
    FROM temporadas
    GROUP BY liga_id, ano
    HAVING COUNT(*) > 1
)
DELETE FROM temporadas
WHERE id = ANY(
    SELECT unnest(ids_duplicados[2:]) -- Exclui o primeiro ID (id_correto) e mantém os demais para deletar
    FROM duplicados
);