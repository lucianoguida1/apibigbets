SELECT nome, MIN(id) AS id_correto, array_agg(id ORDER BY id ASC) AS ids_duplicados
FROM pais
GROUP BY nome
HAVING COUNT(*) > 1;


WITH mapeamento AS (
    SELECT p1.id AS id_correto, p2.id AS id_duplicado
    FROM pais p1
    JOIN pais p2 ON p1.nome = p2.nome AND p1.id < p2.id
)
UPDATE ligas
SET pai_id = mapeamento.id_correto
FROM mapeamento
WHERE ligas.pai_id = mapeamento.id_duplicado;


DELETE FROM pais
WHERE id IN (
    SELECT p.id
    FROM pais p
    LEFT JOIN (
        SELECT MIN(id) AS id_correto
        FROM pais
        GROUP BY nome
    ) AS unicos ON p.id = unicos.id_correto
    WHERE unicos.id_correto IS NULL
);
