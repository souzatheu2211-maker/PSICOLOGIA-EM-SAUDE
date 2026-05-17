import { Question } from '../types/game';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "A definição de saúde mental da OMS enfatiza principalmente:",
    options: [
      "A) Bem-estar e capacidade funcional no cotidiano",
      "B) Ausência completa de sofrimento emocional",
      "C) Controle total das emoções em qualquer situação",
      "D) Ausência de transtornos psiquiátricos diagnosticados"
    ],
    correctAnswer: 0,
    difficulty: 'fácil',
    explanation: "A OMS define saúde mental como um estado de bem-estar que permite ao indivíduo lidar com o estresse e contribuir com sua comunidade.",
    hint: "Pense na saúde como algo positivo e funcional, não apenas a falta de doença."
  },
  {
    id: 2,
    text: "No contexto hospitalar, um fator diretamente relacionado ao desgaste psíquico é:",
    options: [
      "A) Redução de responsabilidades clínicas",
      "B) Rotina previsível e estável",
      "C) Exposição repetida a sofrimento, urgências e morte",
      "D) Trabalho com baixa carga emocional"
    ],
    correctAnswer: 2,
    difficulty: 'fácil',
    explanation: "A exposição frequente ao sofrimento humano e situações críticas é um dos principais estressores ocupacionais na saúde.",
    hint: "O contato direto com a dor alheia tem um custo emocional."
  },
  {
    id: 3,
    text: "A ansiedade se torna patológica principalmente quando:",
    options: [
      "A) Surge antes de situações importantes",
      "B) Acontece apenas em ambientes hospitalares",
      "C) Aparece em situações de perigo real",
      "D) É persistente e causa prejuízo funcional na rotina"
    ],
    correctAnswer: 3,
    difficulty: 'fácil',
    explanation: "Diferente da ansiedade normal, a patológica é desproporcional, persistente e impede a realização de tarefas diárias.",
    hint: "O divisor de águas é o quanto isso atrapalha sua vida."
  },
  {
    id: 4,
    text: "Sobrecarga de trabalho na enfermagem ocorre quando:",
    options: [
      "A) Há excesso de demanda para poucos profissionais disponíveis",
      "B) Há divisão equilibrada de tarefas e pausas suficientes",
      "C) Existe autonomia total para todos na equipe",
      "D) Há baixa responsabilidade técnica no setor"
    ],
    correctAnswer: 0,
    difficulty: 'fácil',
    explanation: "A sobrecarga é caracterizada pelo desequilíbrio entre o volume de trabalho e os recursos humanos disponíveis.",
    hint: "É quando a conta de 'pacientes vs profissionais' não fecha."
  },
  {
    id: 5,
    text: "A falta de reconhecimento profissional tende a gerar:",
    options: [
      "A) Maior resiliência automática e motivação",
      "B) Desmotivação e sensação de desvalorização",
      "C) Redução de conflitos e estresse",
      "D) Melhora da produtividade por pressão psicológica"
    ],
    correctAnswer: 1,
    difficulty: 'fácil',
    isBonus: true,
    explanation: "A desvalorização profissional é um fator psicossocial de risco que impacta diretamente na saúde mental do trabalhador.",
    hint: "Como você se sente quando seu esforço não é notado?"
  },
  {
    id: 6,
    text: "Segundo Hirigoyen, o elemento que mais caracteriza assédio moral é:",
    options: [
      "A) A existência de um conflito aberto e direto entre colegas",
      "B) A cobrança institucional por produtividade elevada",
      "C) A repetição sistemática de condutas abusivas com intenção de fragilizar a vítima",
      "D) O estresse intenso causado pela rotina hospitalar"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    isMaldade: true,
    explanation: "O assédio moral exige repetição e a intenção deliberada de desestabilizar emocionalmente o outro.",
    hint: "Não é um conflito isolado, é algo persistente e tóxico."
  },
  {
    id: 7,
    text: "Burnout se diferencia de estresse comum principalmente porque:",
    options: [
      "A) É sempre acompanhado por delírios e alucinações",
      "B) É um processo crônico relacionado ao trabalho e ao esgotamento emocional",
      "C) Surge apenas por acontecimentos traumáticos isolados",
      "D) Se manifesta apenas como dor física, sem impacto emocional"
    ],
    correctAnswer: 1,
    difficulty: 'médio',
    explanation: "O Burnout é uma síndrome especificamente ligada ao contexto laboral e ao esgotamento de recursos internos.",
    hint: "Pense em algo que 'queima' lentamente até o fim."
  },
  {
    id: 8,
    text: "Um ambiente com alta cobrança e baixa autonomia tende a gerar no trabalhador:",
    options: [
      "A) Sensação de impotência e aumento de tensão emocional",
      "B) Redução automática de ansiedade com o tempo",
      "C) Aumento do controle emocional e produtividade constante",
      "D) Melhora contínua do humor e da autoestima"
    ],
    correctAnswer: 0,
    difficulty: 'médio',
    explanation: "O modelo de 'Exigência-Controle' mostra que alta demanda sem poder de decisão é altamente estressante.",
    hint: "É a sensação de ser cobrado por algo que você não controla."
  },
  {
    id: 9,
    text: "A depressão, em comparação com tristeza comum, se caracteriza mais por:",
    options: [
      "A) Duração curta e sem prejuízo funcional",
      "B) Aumento de energia e melhora do desempenho",
      "C) Persistência, perda de prazer e prejuízo no funcionamento diário",
      "D) Oscilação rápida de humor com melhora espontânea"
    ],
    correctAnswer: 2,
    difficulty: 'médio',
    explanation: "A depressão patológica envolve anedonia (perda de prazer) e dura muito mais que uma tristeza passageira.",
    hint: "A tristeza passa, a depressão permanece e paralisa."
  },
  {
    id: 10,
    text: "O adoecimento mental do profissional pode aumentar risco ao paciente porque:",
    options: [
      "A) O paciente se torna mais agressivo ao perceber tensão",
      "B) O profissional perde totalmente a capacidade técnica",
      "C) O hospital reduz automaticamente sua equipe",
      "D) Pode comprometer atenção, julgamento e tomada de decisão"
    ],
    correctAnswer: 3,
    difficulty: 'médio',
    isBonus: true,
    explanation: "O sofrimento psíquico afeta funções cognitivas essenciais para a segurança do paciente.",
    hint: "Quem não está bem mentalmente tem mais chance de cometer erros."
  },
  {
    id: 11,
    text: "O termo “distresse” se refere a:",
    options: [
      "A) Estresse positivo que melhora desempenho",
      "B) Estresse prejudicial que ultrapassa capacidade de adaptação",
      "C) Estado neutro de alerta sem impacto psicológico",
      "D) Relaxamento fisiológico após pressão"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "Distresse é o estresse nocivo, que causa danos à saúde, ao contrário do eustresse (estresse positivo).",
    hint: "É o lado 'ruim' e desadaptativo do estresse."
  },
  {
    id: 12,
    text: "Qual conjunto de sinais é mais compatível com ansiedade patológica?",
    options: [
      "A) Preocupação persistente + sintomas físicos + prejuízo funcional",
      "B) Nervosismo pontual + alívio rápido + sono normal",
      "C) Medo leve + melhora espontânea em minutos",
      "D) Irritação eventual sem impacto na rotina"
    ],
    correctAnswer: 0,
    difficulty: 'difícil',
    explanation: "A tríade de persistência, sintomas somáticos e impacto na vida define a patologia.",
    hint: "Não é apenas um 'friozinho na barriga' antes da prova."
  },
  {
    id: 13,
    text: "Relações hierárquicas verticais rígidas podem favorecer assédio moral porque:",
    options: [
      "A) Reduzem conflitos interpessoais automaticamente",
      "B) Favorecem igualdade entre membros da equipe",
      "C) Facilitam abuso de poder e silenciamento da vítima",
      "D) Diminuem pressão psicológica no ambiente"
    ],
    correctAnswer: 2,
    difficulty: 'difícil',
    explanation: "Estruturas muito rígidas dificultam a denúncia e protegem o agressor que detém o poder.",
    hint: "Onde o poder é absoluto, o abuso encontra espaço."
  },
  {
    id: 14,
    text: "A despersonalização, presente em Burnout, significa:",
    options: [
      "A) Perda de memória e desorientação",
      "B) Redução da empatia e distanciamento emocional do paciente",
      "C) Euforia persistente e hiperatividade",
      "D) Alucinações e delírios"
    ],
    correctAnswer: 1,
    difficulty: 'difícil',
    explanation: "É um mecanismo de defesa onde o profissional passa a tratar o paciente como um objeto ou número.",
    hint: "É quando o 'cuidar' se torna mecânico e frio."
  },
  {
    id: 15,
    text: "Qual intervenção institucional tem maior impacto na prevenção do adoecimento mental?",
    options: [
      "A) Apoio psicológico, dimensionamento adequado e valorização profissional",
      "B) Aumento de carga horária para adaptação",
      "C) Punição rígida para evitar erros",
      "D) Cobrança de produtividade como meta principal"
    ],
    correctAnswer: 0,
    difficulty: 'difícil',
    isBonus: true,
    explanation: "Prevenção exige mudanças estruturais no ambiente de trabalho, não apenas ações individuais.",
    hint: "Cuidar de quem cuida exige recursos e respeito."
  }
];

export const PROFESSOR_TRICK: Question = {
  id: 999,
  text: "Qual o nome completo do professor da disciplina Psicologia em Saúde?",
  options: [
    "A) Moacir Oliveira Lira",
    "B) Moacir Lira Oliveira Santos",
    "C) Moacir Lima de Oliveira",
    "D) Moacir Lira de Oliveira"
  ],
  correctAnswer: 3,
  difficulty: 'difícil',
  explanation: "O professor Moacir Lira de Oliveira é quem guia seus estudos nesta jornada!",
  hint: "Lembre-se da chamada ou do plano de ensino!"
};