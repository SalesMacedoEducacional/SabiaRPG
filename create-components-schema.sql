-- Create components table and populate with default data
CREATE TABLE IF NOT EXISTS componentes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  cor_hex text NOT NULL,
  ano_serie text NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamp DEFAULT now(),
  atualizado_em timestamp DEFAULT now()
);

-- Create turma_componentes relationship table
CREATE TABLE IF NOT EXISTS turma_componentes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id uuid REFERENCES turmas(id) ON DELETE CASCADE,
  componente_id uuid REFERENCES componentes(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES usuarios(id),
  ano_serie text NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamp DEFAULT now()
);

-- Insert default components with correct colors and years
INSERT INTO componentes (nome, cor_hex, ano_serie) VALUES
  ('Linguagens e suas Tecnologias', '#4DA3A9', '1º Ano'),
  ('Linguagens e suas Tecnologias', '#4DA3A9', '2º Ano'),
  ('Linguagens e suas Tecnologias', '#4DA3A9', '3º Ano'),
  ('Matemática e suas Tecnologias', '#D4A054', '1º Ano'),
  ('Matemática e suas Tecnologias', '#D4A054', '2º Ano'),
  ('Matemática e suas Tecnologias', '#D4A054', '3º Ano'),
  ('Ciências da Natureza', '#A6E3E9', '1º Ano'),
  ('Ciências da Natureza', '#A6E3E9', '2º Ano'),
  ('Ciências da Natureza', '#A6E3E9', '3º Ano'),
  ('Ciências Humanas e Sociais Aplicadas', '#FFC23C', '1º Ano'),
  ('Ciências Humanas e Sociais Aplicadas', '#FFC23C', '2º Ano'),
  ('Ciências Humanas e Sociais Aplicadas', '#FFC23C', '3º Ano'),
  ('Arte e Educação Física', '#312E26', '1º Ano'),
  ('Arte e Educação Física', '#312E26', '2º Ano'),
  ('Arte e Educação Física', '#312E26', '3º Ano')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_turma_componentes_turma ON turma_componentes(turma_id);
CREATE INDEX IF NOT EXISTS idx_turma_componentes_componente ON turma_componentes(componente_id);
CREATE INDEX IF NOT EXISTS idx_turma_componentes_professor ON turma_componentes(professor_id);
CREATE INDEX IF NOT EXISTS idx_componentes_ano_serie ON componentes(ano_serie);