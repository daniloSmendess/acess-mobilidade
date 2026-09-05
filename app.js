/**
 * AcessiMobilidade - Interatividade, Acessibilidade e Cálculos NBR 9050
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. GESTÃO DE ACESSIBILIDADE (Fonte, Alto Contraste, Leitor de Voz)
  initAccessibilityToolbar();

  // 2. ACORDEÃO DE LEIS
  initLawsAccordion();

  // 3. CALCULADORA DE RAMPAS NBR 9050
  initRampCalculator();

  // 4. MAPA / EXPLORADOR DE PONTOS ACESSÍVEIS
  initPlacesExplorer();

  // 5. QUIZ INTERATIVO
  initQuiz();

  // 6. GERADOR DE DENÚNCIA / RECLAMAÇÃO
  initComplaintGenerator();
});

/* ==========================================================================
   1. BARRA DE ACESSIBILIDADE (FONTE, CONTRASTE E TTS)
   ========================================================================== */
function initAccessibilityToolbar() {
  let currentFontSize = 16;
  const minFontSize = 12;
  const maxFontSize = 24;

  const btnIncrease = document.getElementById('btn-increase-font');
  const btnDecrease = document.getElementById('btn-decrease-font');
  const btnReset = document.getElementById('btn-reset-font');
  const btnTheme = document.getElementById('btn-theme-toggle');
  const btnSpeak = document.getElementById('btn-speak');
  const themeLabel = document.getElementById('theme-label');
  const speakLabel = document.getElementById('speak-label');
  const speakIcon = document.getElementById('speak-icon');

  // Ajuste de Tamanho de Fonte
  btnIncrease?.addEventListener('click', () => {
    if (currentFontSize < maxFontSize) {
      currentFontSize += 2;
      document.documentElement.style.fontSize = `${currentFontSize}px`;
    }
  });

  btnDecrease?.addEventListener('click', () => {
    if (currentFontSize > minFontSize) {
      currentFontSize -= 2;
      document.documentElement.style.fontSize = `${currentFontSize}px`;
    }
  });

  btnReset?.addEventListener('click', () => {
    currentFontSize = 16;
    document.documentElement.style.fontSize = `16px`;
  });

  // Alternância de Alto Contraste
  let isHighContrast = false;
  btnTheme?.addEventListener('click', () => {
    isHighContrast = !isHighContrast;
    document.body.classList.toggle('high-contrast', isHighContrast);
    if (themeLabel) {
      themeLabel.textContent = isHighContrast ? 'Contraste Normal' : 'Alto Contraste';
    }
  });

  // Síntese de Voz (Text-to-Speech)
  let isSpeaking = false;
  let speechSynth = window.speechSynthesis;
  let currentUtterance = null;

  btnSpeak?.addEventListener('click', () => {
    if (!speechSynth) {
      alert('Seu navegador não suporta a funcionalidade de síntese de voz.');
      return;
    }

    if (isSpeaking) {
      speechSynth.cancel();
      isSpeaking = false;
      btnSpeak.classList.remove('speaking');
      speakLabel.textContent = 'Ouvir Página';
      speakIcon.className = 'ph-bold ph-speaker-high';
    } else {
      const mainContent = document.getElementById('main-content');
      const textToRead = mainContent ? mainContent.innerText : document.body.innerText;
      
      currentUtterance = new SpeechSynthesisUtterance(textToRead);
      currentUtterance.lang = 'pt-BR';
      currentUtterance.rate = 1.0;

      currentUtterance.onend = () => {
        isSpeaking = false;
        btnSpeak.classList.remove('speaking');
        speakLabel.textContent = 'Ouvir Página';
        speakIcon.className = 'ph-bold ph-speaker-high';
      };

      currentUtterance.onerror = () => {
        isSpeaking = false;
        btnSpeak.classList.remove('speaking');
        speakLabel.textContent = 'Ouvir Página';
        speakIcon.className = 'ph-bold ph-speaker-high';
      };

      speechSynth.speak(currentUtterance);
      isSpeaking = true;
      btnSpeak.classList.add('speaking');
      speakLabel.textContent = 'Parar Leitura';
      speakIcon.className = 'ph-bold ph-stop-circle';
    }
  });
}

/* ==========================================================================
   2. ACORDEÃO DE LEIS & DIREITOS
   ========================================================================== */
function initLawsAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Fecha todos os outros itens
      accordionItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherBtn = otherItem.querySelector('.accordion-header');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Alterna o atual
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   3. CALCULADORA DE RAMPAS NBR 9050
   ========================================================================== */
function initRampCalculator() {
  const btnCalculate = document.getElementById('btn-calculate-ramp');
  const heightInput = document.getElementById('height-input');
  const unitSelect = document.getElementById('height-unit');
  const slopeSelect = document.getElementById('ramp-target-slope');

  const resLength = document.getElementById('res-length');
  const resSlope = document.getElementById('res-slope');
  const resLandings = document.getElementById('res-landings');
  const visualSlopeText = document.getElementById('visual-slope-text');
  const visualHText = document.getElementById('visual-h-text');
  const visualLText = document.getElementById('visual-l-text');
  const verdictBox = document.getElementById('nbr-verdict-box');
  const verdictText = document.getElementById('verdict-text');
  const verdictIcon = document.getElementById('verdict-icon');

  function calculate() {
    let rawHeight = parseFloat(heightInput.value);
    if (isNaN(rawHeight) || rawHeight <= 0) {
      alert('Por favor, insira um valor válido de altura de desnível.');
      return;
    }

    const unit = unitSelect.value;
    // Converter altura sempre para centímetros (h_cm) e metros (h_m)
    let h_cm = unit === 'm' ? rawHeight * 100 : rawHeight;
    let h_m = h_cm / 100;

    const slopePercent = parseFloat(slopeSelect.value); // Ex: 8.33, 6.25, 5.00, etc.

    // Comprimento horizontal da rampa (L = h / (i / 100))
    const lengthMeters = h_m / (slopePercent / 100);

    // Conforme NBR 9050, o desnível máximo por segmento de rampa:
    // Para i = 8,33%: max 0,80m por segmento
    // Para i = 6,25%: max 1,00m por segmento
    let maxRisePerSegment = 0.80;
    if (slopePercent <= 6.25) maxRisePerSegment = 1.00;
    if (slopePercent <= 5.00) maxRisePerSegment = 1.50;

    let requiredLandings = 0;
    if (h_m > maxRisePerSegment) {
      requiredLandings = Math.floor(h_m / maxRisePerSegment);
      if (h_m % maxRisePerSegment === 0) requiredLandings -= 1;
    }

    // Atualiza resultados no DOM
    resLength.textContent = `${lengthMeters.toFixed(2).replace('.', ',')} metros`;
    resSlope.textContent = `${slopePercent.toFixed(2).replace('.', ',')}%`;
    
    if (requiredLandings > 0) {
      resLandings.textContent = `${requiredLandings} patamar(es) intermediário(s) de no mínimo 1,20m`;
    } else {
      resLandings.textContent = `Nenhum patamar intermediário obrigatório (apenas início e fim)`;
    }

    visualSlopeText.textContent = `${slopePercent}%`;
    visualHText.textContent = `h = ${h_cm.toFixed(0)} cm`;
    visualLText.textContent = `L = ${lengthMeters.toFixed(2)} m`;

    // Avaliação de Conformidade NBR 9050
    if (slopePercent > 8.33 && h_cm > 20) {
      verdictBox.className = 'nbr-verdict warning';
      verdictIcon.className = 'ph-bold ph-warning-octagon';
      verdictText.textContent = `Atenção: Inclinações acima de 8,33% só são admitidas pela NBR 9050 para pequenas reformas com desnível máximo de 20cm!`;
    } else if (h_m > 1.5 && slopePercent > 6.25) {
      verdictBox.className = 'nbr-verdict warning';
      verdictIcon.className = 'ph-bold ph-info';
      verdictText.textContent = `Para desníveis grandes (> 1,50m), a NBR 9050 recomenda inclinações menores (5% a 6,25%) ou uso de plataforma elevatória.`;
    } else {
      verdictBox.className = 'nbr-verdict';
      verdictIcon.className = 'ph-bold ph-shield-check';
      verdictText.textContent = `Totalmente em conformidade com a NBR 9050 para circulação autônoma, segura e confortável!`;
    }
  }

  btnCalculate?.addEventListener('click', calculate);
  heightInput?.addEventListener('input', () => {
    if (heightInput.value) calculate();
  });
  slopeSelect?.addEventListener('change', calculate);
  unitSelect?.addEventListener('change', calculate);

  // Executa uma vez no início
  calculate();
}

/* ==========================================================================
   4. GUIA & PONTOS DE INTERESSE ACESSÍVEIS (EXPLORADOR URBANO)
   ========================================================================== */
const samplePlaces = [
  {
    id: 1,
    category: 'transporte',
    catLabel: 'Transporte & Metrô',
    title: 'Estação Central Integrada',
    address: 'Av. Paulista, 1000 - Centro',
    rating: '4.9 ★★★★★',
    features: ['Elevadores com áudio', 'Piso Tátil Direcional', 'Catracas Largas (90cm)', 'Banheiro Adaptado NBR 9050']
  },
  {
    id: 2,
    category: 'cultura',
    catLabel: 'Cultura & Parques',
    title: 'Museu de Arte Moderna & Parque',
    address: 'Parque Ibirapuera, Portão 3',
    rating: '5.0 ★★★★★',
    features: ['Rampas Suaves 5%', 'Cadeiras de Rodas Gratuitas', 'Audioguia & Braille', 'Vagas Exclusivas Sinalizadas']
  },
  {
    id: 3,
    category: 'saude',
    catLabel: 'Saúde & Hospitais',
    title: 'Hospital das Clínicas & Centro de Reabilitação',
    address: 'Rua Dr. Enéas de Carvalho, 255',
    rating: '4.8 ★★★★★',
    features: ['Acesso 100% Plano', 'Portas Automáticas', 'Sanitários com Campainha', 'Maca e Cadeiras Especiais']
  },
  {
    id: 4,
    category: 'comercio',
    catLabel: 'Centros Comerciais',
    title: 'Shopping Center Boulevard',
    address: 'Av. das Nações Unidas, 4777',
    rating: '4.7 ★★★★☆',
    features: ['Empréstimo de Scooter Motorizada', 'Vagas com Faixa Adicional', 'Praça de Alimentação Acessível', 'Fraldário e Apoio']
  },
  {
    id: 5,
    category: 'transporte',
    catLabel: 'Transporte & Metrô',
    title: 'Terminal Rodoviário Interestadual',
    address: 'Rua Cruzeiro do Sul, 1800',
    rating: '4.6 ★★★★☆',
    features: ['Plataformas Elevatórias nos Ônibus', 'Guichê em Altura Acessível', 'Sala de Espera Prioritária']
  },
  {
    id: 6,
    category: 'cultura',
    catLabel: 'Cultura & Parques',
    title: 'Biblioteca Pública Estadual',
    address: 'Praça da República, 290',
    rating: '4.9 ★★★★★',
    features: ['Elevador Panorâmico', 'Mesas com Altura Livre 75cm', 'Sinalização em Alto Relevo', 'Espaço de Leitura Acessível']
  }
];

function initPlacesExplorer() {
  const container = document.getElementById('places-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderPlaces(filter = 'all') {
    if (!container) return;
    container.innerHTML = '';

    const filtered = filter === 'all' 
      ? samplePlaces 
      : samplePlaces.filter(p => p.category === filter);

    filtered.forEach(place => {
      const card = document.createElement('div');
      card.className = 'place-card';
      card.innerHTML = `
        <div class="place-header">
          <span class="place-cat">${place.catLabel}</span>
          <span class="place-rating">${place.rating}</span>
        </div>
        <h4 class="place-title">${place.title}</h4>
        <div class="place-address"><i class="ph-bold ph-map-pin"></i> ${place.address}</div>
        <div class="place-features">
          ${place.features.map(f => `<span class="feature-tag checked"><i class="ph-bold ph-check"></i> ${f}</span>`).join('')}
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderPlaces(filter);
    });
  });

  renderPlaces('all');
}

/* ==========================================================================
   5. QUIZ INTERATIVO (MITOS E VERDADES)
   ========================================================================== */
const quizQuestions = [
  {
    question: "Pessoas com gesso na perna ou gestantes têm direito legal a assento prioritário e atendimento preferencial?",
    options: [
      { text: "Sim, pois se enquadram no conceito legal de pessoa com mobilidade reduzida.", correct: true },
      { text: "Não, apenas pessoas com deficiência física comprovada por laudo permanente.", correct: false },
      { text: "Apenas se tiverem mais de 60 anos.", correct: false }
    ],
    explanation: "Correto! A Lei nº 10.098/2000 e a LBI incluem qualquer pessoa que tenha dificuldade de locomoção, mesmo temporária (como fraturas e gestação)."
  },
  {
    question: "Qual é a inclinação padrão ideal recomendada pela NBR 9050 para a maioria das rampas de pedestres?",
    options: [
      { text: "15% a 20% de inclinação", correct: false },
      { text: "8,33% (proporção 1:12)", correct: true },
      { text: "30% com degraus embutidos", correct: false }
    ],
    explanation: "Exato! 8,33% (1 metro de comprimento para cada 8,33 cm de altura) permite que o cadeirante suba com autonomia e desça com segurança."
  },
  {
    question: "Qual é a largura mínima livre para uma porta ser considerada acessível a cadeirantes segundo a norma?",
    options: [
      { text: "60 cm (largura padrão de banheiro)", correct: false },
      { text: "80 cm (0,80 m) de vão livre", correct: true },
      { text: "1,20 m obrigatoriamente", correct: false }
    ],
    explanation: "Perfeito! O vão livre mínimo é de 80 cm, permitindo a passagem confortável de cadeiras de rodas manuais e motorizadas."
  },
  {
    question: "Estacionar em vaga exclusiva de pessoa com deficiência ou idoso sem credencial visível gera qual penalidade?",
    options: [
      { text: "Apenas advertência verbal do guarda", correct: false },
      { text: "Infração gravíssima (7 pontos na CNH, multa e guincho do veículo)", correct: true },
      { text: "Multa leve de R$ 50,00", correct: false }
    ],
    explanation: "Correto! Desde a sanção da LBI, o CTB classifica essa conduta como infração gravíssima sujeita a remoção do veículo."
  },
  {
    question: "O acompanhante de passageiro aéreo que necessita de assistência médica contínua tem direito a desconto na passagem?",
    options: [
      { text: "Sim, no mínimo 80% de desconto na tarifa (Resolução ANAC 280/2013)", correct: true },
      { text: "Não, o acompanhante paga o valor integral da passagem", correct: false },
      { text: "Apenas se o voo for internacional", correct: false }
    ],
    explanation: "Muito bem! A ANAC garante desconto de no mínimo 80% para o acompanhante obrigatório quando aprovado no formulário médico (MEDIF)."
  }
];

function initQuiz() {
  let currentQIndex = 0;
  let score = 0;

  const qText = document.getElementById('quiz-question-text');
  const optionsBox = document.getElementById('quiz-options');
  const progressText = document.getElementById('quiz-progress-indicator');
  const scoreText = document.getElementById('quiz-score-indicator');
  const feedbackBox = document.getElementById('quiz-feedback');
  const feedbackText = document.getElementById('quiz-feedback-text');
  const btnNext = document.getElementById('btn-next-question');

  function loadQuestion(index) {
    if (index >= quizQuestions.length) {
      // Fim do Quiz
      qText.innerHTML = `🎉 Parabéns! Você concluiu o Quiz!`;
      optionsBox.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="font-size: 1.2rem; font-weight: 700; margin-bottom: 12px;">Sua pontuação final: ${score} de ${quizQuestions.length} acertos!</p>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Você agora está muito mais preparado para defender e promover a acessibilidade universal.</p>
          <button id="btn-restart-quiz" class="btn btn-primary"><i class="ph-bold ph-arrow-counter-clockwise"></i> Refazer Quiz</button>
        </div>
      `;
      feedbackBox.style.display = 'none';
      progressText.textContent = 'Quiz Finalizado';
      document.getElementById('btn-restart-quiz')?.addEventListener('click', () => {
        currentQIndex = 0;
        score = 0;
        scoreText.textContent = `Pontuação: 0`;
        loadQuestion(0);
      });
      return;
    }

    const q = quizQuestions[index];
    progressText.textContent = `Pergunta ${index + 1} de ${quizQuestions.length}`;
    qText.textContent = q.question;
    optionsBox.innerHTML = '';
    feedbackBox.style.display = 'none';

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.textContent = opt.text;

      btn.addEventListener('click', () => {
        // Desativa todos os botões
        const allBtns = optionsBox.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach(b => b.disabled = true);

        if (opt.correct) {
          btn.classList.add('correct');
          score++;
          scoreText.textContent = `Pontuação: ${score}`;
          feedbackText.innerHTML = `<strong>✨ Muito bem!</strong> ${q.explanation}`;
        } else {
          btn.classList.add('wrong');
          // Destaca a correta
          allBtns.forEach((b, i) => {
            if (q.options[i].correct) b.classList.add('correct');
          });
          feedbackText.innerHTML = `<strong>❌ Incorreto.</strong> ${q.explanation}`;
        }

        feedbackBox.style.display = 'block';
      });

      optionsBox.appendChild(btn);
    });
  }

  btnNext?.addEventListener('click', () => {
    currentQIndex++;
    loadQuestion(currentQIndex);
  });

  loadQuestion(0);
}

/* ==========================================================================
   6. GERADOR DE RECLAMAÇÃO / DENÚNCIA
   ========================================================================== */
function initComplaintGenerator() {
  const btnGen = document.getElementById('btn-generate-complaint');
  const btnCopy = document.getElementById('btn-copy-complaint');
  const placeInput = document.getElementById('den-place');
  const addressInput = document.getElementById('den-address');
  const problemSelect = document.getElementById('den-problem');
  const resultBox = document.getElementById('complaint-result-box');
  const outputTextarea = document.getElementById('complaint-text-output');
  const copyFeedback = document.getElementById('copy-feedback');

  btnGen?.addEventListener('click', () => {
    const place = placeInput.value.trim() || '[Nome do Estabelecimento / Local]';
    const address = addressInput.value.trim() || '[Endereço Completo]';
    const problem = problemSelect.value;
    const today = new Date().toLocaleDateString('pt-BR');

    const generatedText = `À Ouvidoria / Ministério Público / Órgão Competente,

Venho por meio desta manifestação registrar formalmente a existência de barreira de acessibilidade e violação aos direitos fundamentais de locomoção, conforme garantido pela Lei Federal nº 13.146/2015 (Lei Brasileira de Inclusão) e pela Lei nº 10.098/2000.

- Local do Ocorrido: ${place}
- Endereço: ${address}
- Data de constatação: ${today}
- Irregularidade constatada: ${problem}, em descumprimento aos parâmetros técnicos estabelecidos na Norma ABNT NBR 9050.

A ausência de condições adequadas de acessibilidade impede o livre trânsito, a autonomia e a segurança de pessoas com deficiência, idosos, gestantes e cidadãos com mobilidade reduzida.

Solicito a realização de fiscalização e as providências cabíveis para a imediata adequação do espaço físico.`;

    outputTextarea.value = generatedText;
    resultBox.style.display = 'flex';
    copyFeedback.textContent = '';
  });

  btnCopy?.addEventListener('click', () => {
    outputTextarea.select();
    navigator.clipboard.writeText(outputTextarea.value).then(() => {
      copyFeedback.textContent = '✓ Texto copiado com sucesso para a área de transferência!';
      setTimeout(() => {
        copyFeedback.textContent = '';
      }, 3500);
    });
  });
}
