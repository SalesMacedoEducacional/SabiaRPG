-- Inserir registro faltante na tabela perfis_gestor para vincular o gestor à segunda escola
INSERT INTO perfis_gestor (
    id,
    usuario_id,
    escola_id,
    ativo,
    criado_em,
    atualizado_em
) VALUES (
    gen_random_uuid(),
    '72e7feef-0741-46ec-bdb4-68dcdfc6defe',
    '3aa2a8a7-141b-42d9-af55-a656247c73b3',
    true,
    NOW(),
    NOW()
) ON CONFLICT (usuario_id, escola_id) DO NOTHING;

-- Verificar todos os perfis de gestor
SELECT 
    pg.id,
    pg.usuario_id,
    pg.escola_id,
    e.nome as escola_nome,
    u.nome as gestor_nome
FROM perfis_gestor pg
JOIN escolas e ON pg.escola_id = e.id
JOIN usuarios u ON pg.usuario_id = u.id
WHERE pg.usuario_id = '72e7feef-0741-46ec-bdb4-68dcdfc6defe'
AND pg.ativo = true;