SELECT time_id,temporada_id, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
FROM timestemporadas
GROUP BY time_id,temporada_id
HAVING COUNT(*) > 1;

WITH duplicados AS (
    SELECT time_id, temporada_id, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
    FROM timestemporadas
    GROUP BY time_id, temporada_id
    HAVING COUNT(*) > 1
)
DELETE FROM timestemporadas
WHERE id = ANY(
    SELECT unnest(ids_duplicados[2:]) -- Exclui o primeiro ID (id_correto) e mantém os demais para deletar
    FROM duplicados
);