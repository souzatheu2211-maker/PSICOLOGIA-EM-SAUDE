import { Question } from '../types/game';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Segundo a OMS, saúde mental é principalmente:",
    options: [
      "A) Ausência de tristeza",
      "B) Bem-estar e capacidade de lidar com desafios do dia a dia",
      "C) Não ter estresse nunca",
      "D) Nunca precisar de ajuda psicológica"
    ],
    correctAnswer: 1,
    difficulty: 'fácil',
    explanation: "A OMS define como bem-estar e funcionamento, não ausência total de sofrimento.",
    hint: "Pense na saúde como um estado funcional e positivo."
  },
  {
    id: 2,
    text: "Qual é um fator que aumenta risco de adoecimento mental em profissionais de enfermagem?",
    options: [
      "A) Plantões longos e sobrecarga de trabalho",
      "B) Descanso frequente e pausas adequadas",
      "C) Boa valorização profissional",
      "D) Equipe completa e apoio psicológico"
    ],
    correctAnswer: 0,
    difficulty: 'fácil',
    explanation: "Sobrecarga e plantões intensos aumentam estresse e desgaste.",
    hint: "O que causa cansaço extremo no hospital?"
  },
  {
    id: 3,
    text: "Quando o estresse se torna um problema de saúde mental?",
    options: [
      "A) Quando aparece antes de uma prova",
      "B) Quando dura pouco tempo",
      "C) Quando é persistente e atrapalha a vida e o trabalho",
      "D) Quando acontece só em dias difíceis"
    ],
    correctAnswer: 2,
    difficulty: 'fácil',
    explanation: "O principal critério é persistência e prejuízo funcional.",
    hint: "O problema é quando ele não vai embora e te trava."
  },
  {
    id: 4,
    text: "Qual alternativa representa um sintoma comum de ansiedade?",
    options: [
      "A) Taquicardia e sensação de falta de ar",
      "B) Perda total da memória",
      "C) Febre alta sempre",
      "D) Crescimento muscular acelerado"
    ],
    correctAnswer: 0,
    difficulty: 'médio',
    explanation: "Ansiedade pode gerar sintomas físicos como palpitação e falta de ar.",
    hint: "Sintomas que parecem um susto físico."
  },
  {
    id: 5,
    text: "Qual consequência pode ocorrer quando o profissional não se sente valorizado no trabalho?",
    options: [
      "A) Mais motivação e alegria",
      "B) Aumento de autoestima",
      "C) Maior foco e menos erros",
      "D) Desmotivação e desgaste emocional"
    ],
    correctAnswer: 3,
    difficulty: 'médio',
    isBonus: true,
    explanation: "Falta de reconhecimento contribui para sofrimento psíquico e burnout.",
    hint: "Como você se sente quando seu esforço é ignorado?"
  },
  {
    id: 6,
    text: "Segundo Hirigoyen, qual alternativa define assédio moral?",
    options: [
      "A) Discussão pontual entre colegas",
      "B) Cobrança rígida de produtividade em momentos de crise",
      "C) Conduta abusiva repetitiva para humilhar e fragilizar a vítima",
      "D) Reclamações comuns sobre escala de plantão"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    isMaldade: true,
    explanation: "Assédio moral é repetitivo e tem intenção de desestabilizar psicologicamente.",
    hint: "Não é um fato isolado, é uma perseguição constante."
  },
  {
    id: 7,
    text: "A Síndrome de Burnout está mais ligada a:",
    options: [
      "A) Estresse crônico relacionado ao trabalho",
      "B) Tristeza passageira por motivos pessoais",
      "C) Medo irracional de hospitais",
      "D) Falta de estudo e conhecimento técnico"
    ],
    correctAnswer: 0,
    difficulty: 'médio',
    explanation: "Burnout é esgotamento emocional associado ao trabalho e sobrecarga.",
    hint: "Pense em 'esgotamento profissional'."
  },
  {
    id: 8,
    text: "No modelo Demanda–Controle (Karasek), o maior risco ocorre quando há:",
    options: [
      "A) Baixa demanda e alto controle",
      "B) Alta demanda e baixo controle",
      "C) Baixa demanda e baixo controle",
      "D) Alta demanda e alto controle"
    ],
    correctAnswer: 1,
    difficulty: 'médio',
    explanation: "Alta exigência com baixa autonomia aumenta risco de estresse ocupacional.",
    hint: "Muita cobrança e pouco poder de decisão."
  },
  {
    id: 9,
    text: "A “despersonalização” no Burnout é melhor descrita como:",
    options: [
      "A) Confusão mental e lapsos graves de memória",
      "B) Distanciamento afetivo e redução da empatia como defesa emocional",
      "C) Tristeza intensa com culpa e isolamento social",
      "D) Medo extremo de realizar procedimentos"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "Despersonalização é frieza/cinismo como mecanismo de defesa.",
    hint: "É quando o profissional se torna 'frio' com o paciente."
  },
  {
    id: 10,
    text: "Por que adoecimento mental do profissional pode aumentar risco ao paciente?",
    options: [
      "A) Porque reduz atenção, julgamento e tomada de decisão",
      "B) Porque o paciente sempre percebe e reage mal",
      "C) Porque a técnica deixa de existir automaticamente",
      "D) Porque o hospital perde recursos financeiros"
    ],
    correctAnswer: 0,
    difficulty: 'difícil',
    isBonus: true,
    explanation: "Fadiga mental afeta cognição e aumenta erros assistenciais.",
    hint: "A mente cansada falha na hora de decidir."
  },
  {
    id: 11,
    text: "O conceito de “distresse” significa:",
    options: [
      "A) Estresse positivo e motivador",
      "B) Estresse prejudicial que ultrapassa capacidade de adaptação",
      "C) Relaxamento após um plantão",
      "D) Sensação de felicidade causada pelo trabalho"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "Distresse é o estresse nocivo (diferente de eustresse).",
    hint: "É o lado ruim do estresse."
  },
  {
    id: 12,
    text: "Qual exemplo representa coping focado no problema?",
    options: [
      "A) Organizar tarefas e buscar soluções objetivas para reduzir a sobrecarga",
      "B) Evitar pensar no trabalho e fingir que está tudo bem",
      "C) Consumir álcool para aliviar ansiedade",
      "D) Culpar colegas para aliviar a frustração"
    ],
    correctAnswer: 0,
    difficulty: 'difícil',
    explanation: "Coping focado no problema tenta modificar a situação estressora.",
    hint: "Atacar a causa do estresse diretamente."
  },
  {
    id: 13,
    text: "Anedonia é definida como:",
    options: [
      "A) Medo intenso acompanhado de taquicardia",
      "B) Perda da capacidade de sentir prazer",
      "C) Aumento de energia e hiperatividade",
      "D) Oscilação de humor em minutos"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "Anedonia é sintoma central da depressão.",
    hint: "Nada mais traz alegria ou satisfação."
  },
  {
    id: 14,
    text: "A fadiga por compaixão está mais relacionada a:",
    options: [
      "A) Exposição prolongada ao sofrimento do outro",
      "B) Falta de disciplina e comprometimento",
      "C) Ausência de estudo técnico",
      "D) Apenas falta de sono"
    ],
    correctAnswer: 0,
    difficulty: 'difícil',
    explanation: "Surge do impacto emocional contínuo ao cuidar de sofrimento intenso.",
    hint: "O custo emocional de cuidar de quem sofre muito."
  },
  {
    id: 15,
    text: "Qual medida institucional é mais eficaz para reduzir adoecimento mental em enfermagem?",
    options: [
      "A) Aumentar carga horária para adaptação",
      "B) Cobrar mais produtividade",
      "C) Melhorar dimensionamento, suporte psicológico e condições de trabalho",
      "D) Estimular competição entre profissionais"
    ],
    correctAnswer: 2,
    difficulty: 'difícil',
    isBonus: true,
    explanation: "Intervenções estruturais e suporte reduzem fatores psicossociais de risco.",
    hint: "Cuidar da estrutura e do apoio humano."
  }
];

export const PROFESSOR_TRICK: Question = {
  id: 999,
  text: "Qual o nome completo do professor da disciplina Psicologia em Saúde?",
  options: [
    "A) Dr. Moacir Lima de Oliveira",
    "B) Dr. Moacir Oliveira Lira",
    "C) Moacir Lira Oliveira Santos",
    "D) Moacir Lira de Oliveira"
  ],
  correctAnswer: 3,
  difficulty: 'difícil',
  explanation: "O professor Moacir Lira de Oliveira é quem guia seus estudos nesta jornada!",
  hint: "Lembre-se da chamada ou do plano de ensino!"
};