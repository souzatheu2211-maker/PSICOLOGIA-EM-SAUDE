import { Question } from '../types/game';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "O que é saúde mental segundo a OMS?",
    options: [
      "Um estado onde não existe tristeza ou ansiedade",
      "Um estado de bem-estar que permite lidar com o estresse e contribuir com a comunidade",
      "Um estado de ausência de doenças físicas",
      "Um estado onde a pessoa não precisa de apoio emocional"
    ],
    correctAnswer: 1,
    difficulty: 'fácil',
    explanation: "A OMS define saúde mental como um estado de bem-estar no qual o indivíduo percebe suas próprias habilidades, pode lidar com os estresses cotidianos, trabalhar produtivamente e contribuir para sua comunidade.",
    hint: "Pense na saúde como algo positivo e funcional, não apenas a falta de doença."
  },
  {
    id: 2,
    text: "Qual desses fatores pode contribuir para o adoecimento mental na enfermagem?",
    options: [
      "Jornada curta e descanso constante",
      "Pouco contato com pacientes",
      "Plantões exaustivos e longas jornadas",
      "Falta de responsabilidade profissional"
    ],
    correctAnswer: 2,
    difficulty: 'fácil',
    explanation: "A exaustão física e mental causada por plantões dobrados e falta de descanso é um dos principais gatilhos para transtornos como Burnout na enfermagem.",
    hint: "O cansaço físico extremo costuma andar de mãos dadas com o mental."
  },
  {
    id: 3,
    text: "Qual sentimento é comum em profissionais que convivem com dor e morte diariamente?",
    options: [
      "Euforia constante",
      "Indiferença total sempre",
      "Tristeza e desgaste emocional",
      "Felicidade automática"
    ],
    correctAnswer: 2,
    difficulty: 'fácil',
    explanation: "A exposição constante ao sofrimento alheio pode gerar a 'fadiga por compaixão', resultando em desgaste emocional profundo.",
    hint: "A empatia pode gerar um custo emocional alto."
  },
  {
    id: 4,
    text: "O que pode acontecer quando a saúde mental do profissional de enfermagem é afetada?",
    options: [
      "A qualidade do atendimento pode ser comprometida",
      "O atendimento melhora automaticamente",
      "O paciente não sofre impacto nenhum",
      "A enfermagem se torna mais fácil"
    ],
    correctAnswer: 0,
    difficulty: 'fácil',
    explanation: "Um profissional psicologicamente abalado tem maior probabilidade de cometer erros técnicos e ser menos empático, prejudicando a segurança do paciente.",
    hint: "Quem não está bem, dificilmente consegue cuidar bem do outro."
  },
  {
    id: 5,
    text: "Qual desses NÃO é um fator de adoecimento mental na enfermagem?",
    options: [
      "Sobrecarga de trabalho",
      "Falta de reconhecimento profissional",
      "Escassez de recursos",
      "Intervalos longos de descanso e férias constantes"
    ],
    correctAnswer: 3,
    difficulty: 'fácil',
    isBonus: true,
    explanation: "O descanso adequado e o lazer são fatores de proteção, não de adoecimento.",
    hint: "Procure a opção que descreve algo saudável e relaxante."
  },
  {
    id: 6,
    text: "O que é assédio moral no trabalho?",
    options: [
      "Um elogio repetitivo para aumentar a motivação",
      "Um conflito pontual entre colegas",
      "Uma conduta abusiva, repetitiva e intencional que fere a dignidade psíquica",
      "Uma cobrança normal de produtividade"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    isMaldade: true,
    explanation: "O assédio moral caracteriza-se pela repetição de atos humilhantes que visam desestabilizar emocionalmente a vítima no ambiente laboral.",
    hint: "É algo tóxico, persistente e que visa diminuir o outro."
  },
  {
    id: 7,
    text: "Por que o ambiente hospitalar favorece o estresse psicológico?",
    options: [
      "Porque sempre há silêncio e calma",
      "Porque não existe pressão",
      "Porque é um ambiente agitado, com emergências e cobranças constantes",
      "Porque os profissionais trabalham sozinhos"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    explanation: "A imprevisibilidade das emergências e a responsabilidade sobre vidas humanas tornam o hospital um ambiente de alta carga tensional.",
    hint: "Hospitais são lugares de decisões rápidas e vida ou morte."
  },
  {
    id: 8,
    text: "O que significa “sobrecarga de trabalho” na enfermagem?",
    options: [
      "Poucos pacientes para muitos profissionais",
      "Muitos profissionais para poucos pacientes",
      "Poucos profissionais para muitos pacientes, aumentando tarefas e responsabilidades",
      "Trabalhar apenas em horário comercial"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    explanation: "O dimensionamento inadequado de pessoal obriga o profissional a realizar tarefas além de sua capacidade, gerando estresse e fadiga.",
    hint: "É quando a demanda é muito maior que a capacidade humana de atender."
  },
  {
    id: 9,
    text: "Qual transtorno é frequentemente associado ao excesso de estresse no trabalho?",
    options: [
      "Síndrome de Burnout",
      "Daltonismo",
      "Amnésia total",
      "Sonambulismo"
    ],
    correctAnswer: 0,
    difficulty: 'médio',
    explanation: "O Burnout é o esgotamento profissional resultante de estresse crônico no local de trabalho que não foi gerenciado com sucesso.",
    hint: "O termo em inglês significa 'queimar-se por completo'."
  },
  {
    id: 10,
    text: "A depressão, no sentido patológico, pode levar a qual consequência grave?",
    options: [
      "Aumento permanente de energia",
      "Ausência total de sono por prazer",
      "Pensamentos que podem culminar em comportamentos suicidas",
      "Melhora imediata do humor"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    isBonus: true,
    explanation: "A depressão grave pode levar à ideação suicida, exigindo intervenção imediata e suporte especializado.",
    hint: "A depressão profunda retira a esperança e o sentido da vida."
  },
  {
    id: 11,
    text: "Qual é uma característica da ansiedade patológica?",
    options: [
      "Dura poucos minutos e não interfere na vida",
      "É proporcional ao perigo real",
      "Preocupação excessiva e persistente que interfere nas atividades diárias",
      "Só acontece durante provas"
    ],
    correctAnswer: 2,
    difficulty: 'difícil',
    explanation: "Diferente da ansiedade normal, a patológica é desproporcional ao estímulo e causa prejuízos funcionais significativos.",
    hint: "Diferente do medo normal, ela é desproporcional e paralisante."
  },
  {
    id: 12,
    text: "Segundo o texto, qual é um dos efeitos do trabalho em regime precarizado/terceirizado?",
    options: [
      "Redução do estresse emocional",
      "Aumento do distresse emocional e sobrecarga mental",
      "Melhora automática do sono",
      "Eliminação da ansiedade"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "A instabilidade contratual e a perda de direitos aumentam a insegurança e o sofrimento psíquico do trabalhador.",
    hint: "A instabilidade gera insegurança e medo do futuro."
  },
  {
    id: 13,
    text: "Segundo Hirigoyen (2002), o assédio moral tem como objetivo principal:",
    options: [
      "Ajudar o outro a evoluir",
      "Controlar e dominar o oponente, usurpando seu território psíquico",
      "Resolver conflitos com diálogo",
      "Melhorar o desempenho geral do hospital"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "Hirigoyen descreve o assédio como um processo de destruição psicológica onde o agressor tenta anular a identidade da vítima.",
    hint: "É uma relação de poder onde um tenta anular a mente do outro."
  },
  {
    id: 14,
    text: "Qual destes sintomas pode aparecer na ansiedade e afetar o corpo fisicamente?",
    options: [
      "Taquicardia e tremores",
      "Crescimento ósseo acelerado",
      "Visão perfeita",
      "Aumento automático da memória"
    ],
    correctAnswer: 0,
    difficulty: 'difícil',
    explanation: "A ansiedade ativa o sistema nervoso simpático, causando reações físicas como palpitações, sudorese e tremores.",
    hint: "O corpo reage como se estivesse em perigo iminente (luta ou fuga)."
  },
  {
    id: 15,
    text: "Por que “cuidar de quem cuida” é considerado essencial no texto?",
    options: [
      "Porque a enfermagem não precisa de apoio psicológico",
      "Porque melhora a aparência dos hospitais",
      "Porque valorizar e apoiar profissionais melhora a qualidade da saúde e protege vidas",
      "Porque reduz o número de pacientes automaticamente"
    ],
    correctAnswer: 2,
    difficulty: 'difícil',
    isBonus: true,
    explanation: "A saúde do profissional é indissociável da qualidade da assistência prestada. Cuidar do cuidador é uma estratégia de segurança do paciente.",
    hint: "Profissionais saudáveis salvam mais vidas."
  }
];

export const PROFESSOR_TRICK: Question = {
  id: 999,
  text: "Qual o nome completo do professor da disciplina Psicologia em Saúde?",
  options: [
    "Moacir Lira de Oliveira",
    "Moacir Oliveira Lima",
    "Moacir Lira Oliveira Santos",
    "Moacir Lima de Andrade"
  ],
  correctAnswer: 0,
  difficulty: 'difícil',
  explanation: "O professor Moacir Lira de Oliveira é o responsável por guiar seus conhecimentos nesta jornada!",
  hint: "Lembre-se da chamada ou do plano de ensino!"
};

export const MOTIVATIONAL_PHRASES = [
  "A mente humana é o maior enigma.",
  "Nem toda escolha é racional.",
  "O erro também é parte do aprendizado.",
  "Conhecer a si mesmo é o começo de toda sabedoria.",
  "A psicologia é a ciência da alma e do comportamento."
];