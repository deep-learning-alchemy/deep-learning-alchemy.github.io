(() => {
  "use strict";

  const sharedIntervals = ["1. (0, 10)", "2. [10, 100)", "3. [100, 1000)", "4. [1000, ∞)"];
  const questions = [
    {
      id: "q1", title: "Depth scaling with a shared block", difficulty: "Hard", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> Recall the five-step depth stress test comparing Standard µP, Depth-µP, and CompleteP. At width <em>n</em> = <em>n</em><sub>0</sub> = 64, reference depth 2, and depth ratio <em>r</em> = L/2, their residual multipliers are 1, r<sup>−1/2</sup>, and r<sup>−1</sup>; block LRs are η, ηr<sup>−1/2</sup>, and η; and block Adam ε values are 10<sup>−8</sup>, 10<sup>−8</sup>r<sup>−1/2</sup>, and 10<sup>−8</sup>r<sup>−1</sup>.</p><p><strong>This question changes.</strong> Depth L = 1000, so r = 500 and c<sub>L</sub> is 1, .0447, and .002 for A, B, and C. The 1,000 blocks are one shared block: a single block, initialized like one block of the stress test, applied 1,000 times with shared weights.</p><p><strong>(a) Residual stream at initialization.</strong> Let ρ be the final-residual RMS in the shared-block model divided by the corresponding RMS with 1,000 independent blocks. Which interval contains ρ?</p><p><strong>(b) Loss after five updates.</strong> For each prescription, take the shared-block model's lowest validation loss after five updates over base LRs {.003, .01, .03}. Which prescription attains the lowest loss?</p>`,
      rows: [
        { id: "q1a1", label: "(a) A. Standard µP", options: sharedIntervals, correct: 1, exact: 4, adjacent: 2 },
        { id: "q1a2", label: "(a) B. Depth-µP", options: sharedIntervals, correct: 1, exact: 4, adjacent: 2 },
        { id: "q1a3", label: "(a) C. CompleteP", options: sharedIntervals, correct: 0, exact: 4, adjacent: 2 },
        { id: "q1b", label: "(b) Lowest loss", options: ["1. A. Standard µP", "2. B. Depth-µP", "3. C. CompleteP", "4. All three within .005"], correct: 2, exact: 8, adjacent: 0 },
      ],
      explanation: `<strong>Answer:</strong> (a) options 2, 2, 1; (b) CompleteP. The measured RMS ratios are about 32.2, 28.6, and 1.56. CompleteP performs best after five updates because it targets full alignment in the shared-block setting.`,
    },
    {
      id: "q2", title: "Predicting loss under joint LR and WD changes", difficulty: "Medium", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> Recall the experiments that swept learning rate and weight decay jointly.</p><p><strong>This question changes.</strong> The LR schedule is cosine decay to zero instead of linear decay (same 1% warmup), at 1.2288B tokens, on the same 3 × 3 LR-WD grid. The best cell is peak LR .003, WD .2, with loss 2.8354. Configurations A-F are: A (.006, .1), B (.0015, .4), C (.006, .4), D (.0015, .1), E (.006, .2), F (.003, .4).</p>`,
      rows: [
        { id: "q2a", label: "(a) Loss ranking", options: ["1. L_A < L_B < L_F < L_E < L_D < L_C", "2. L_D < L_B < L_F < L_E < L_A < L_C", "3. L_F < L_E < L_A < L_B < L_C < L_D", "4. L_C < L_E < L_F < L_A < L_B < L_D"], correct: 0, exact: 10, adjacent: 0 },
        { id: "q2b", label: "(b) C's excess loss, L_C − 2.8354", options: ["1. [0, .005)", "2. [.005, .015)", "3. [.015, .025)", "4. [.025, ∞)"], correct: 3, exact: 10, adjacent: 5 },
      ],
      explanation: `<strong>Answer:</strong> (a) option 1, A &lt; B &lt; F &lt; E &lt; D &lt; C; (b) option 4. Configuration C's measured excess loss is about 0.032.`,
    },
    {
      id: "q3", title: "Extrapolating Hyperball's optimal LR", difficulty: "Easy", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> Recall the Hyperball scaling ladders. Hyperball is used for every linear-layer weight matrix, including the readout; Adam is used on embeddings and normalization gains at peak LR .1041η; weight decay is disabled.</p><img class="quiz-prompt-image" src="assets/quizzes/hyperparameter_scaling_q3.png" alt="Fitted optimal peak learning rate decreases as training tokens increase from 0.1536B to 1.2288B, with a prediction requested at 2.4576B tokens." /><p><strong>This question changes.</strong> The token budget is 2.4576B tokens, with peak LRs {.006, .01, .015}. Which interval contains the fitted optimum?</p>`,
      rows: [{ id: "q3a", label: "Fitted optimum at 2.4576B tokens", options: ["1. [.0075, ∞)", "2. [.0055, .0075)", "3. [.004, .0055)", "4. (0, .004)"], correct: 0, exact: 20, adjacent: 10 }],
      explanation: `<strong>Answer:</strong> option 1. Extending the Hyperball trend gives a fitted optimum of about 0.008.`,
    },
    {
      id: "q4", title: "Batch size and momentum", difficulty: "Easy", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> Recall the experiments varying momentum at 614.4M tokens, with β<sub>2</sub> = .95 fixed.</p><p><strong>This question changes.</strong> At batch size 8, peak LR is .00075, WD is .1, and loss at β<sub>1</sub> = .9 is 2.936603. At batch size 256, peak LR is .0015, WD is 1.944, and loss at β<sub>1</sub> = .9 is 2.968249. For each, A uses β<sub>1</sub> = 0, B uses .9, and C uses .98.</p>`,
      rows: [
        { id: "q4a1", label: "(a) Ranking, B = 8", options: ["1. L_C < L_B < L_A", "2. L_A < L_B < L_C", "3. L_A < L_C < L_B", "4. L_B < L_C < L_A"], correct: 0, exact: 5, adjacent: 0 },
        { id: "q4a2", label: "(a) Ranking, B = 256", options: ["1. L_C < L_B < L_A", "2. L_A < L_B < L_C", "3. L_A < L_C < L_B", "4. L_B < L_C < L_A"], correct: 3, exact: 5, adjacent: 0 },
        { id: "q4b1", label: "(b) L_A − L_B, B = 8", options: ["1. (−∞, .01)", "2. [.01, .06)", "3. [.06, .15)", "4. [.15, ∞)"], correct: 1, exact: 5, adjacent: 2.5 },
        { id: "q4b2", label: "(b) L_A − L_B, B = 256", options: ["1. (−∞, .01)", "2. [.01, .06)", "3. [.06, .15)", "4. [.15, ∞)"], correct: 3, exact: 5, adjacent: 2.5 },
      ],
      explanation: `<strong>Answer:</strong> rankings are option 1 at B = 8 and option 4 at B = 256. The costs of removing momentum are about 0.0276 and 0.2503, giving options 2 and 4.`,
    },
    {
      id: "q5", title: "Does learning-rate transfer survive changing the readout?", difficulty: "Medium", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> Recall width scaling at 153.6M tokens, with n<sub>0</sub> = 512 and m = n/n<sub>0</sub>.</p><p><strong>This question changes.</strong> Almost-µP uses µP's embedding initialization (G/n<sub>0</sub>) and hidden-matrix LR (η/m), but the course baseline's readout initialization (G/√n) and readout multiplier (1). It is trained at width 1024 with peak LRs {.00075, .0015, .003, .006, .012}.</p>`,
      rows: [
        { id: "q5a", label: "(a) η*(1024) / η*(512), where η*(512) = .002378", options: ["1. (0, .5)", "2. [.5, .8)", "3. [.8, 1.25)", "4. [1.25, ∞)"], correct: 2, exact: 10, adjacent: 5 },
        { id: "q5b", label: "(b) Transfer penalty for peak LR .003", options: ["1. [.15, ∞)", "2. [.06, .15)", "3. [.01, .06)", "4. [0, .01)"], correct: 2, exact: 10, adjacent: 5 },
      ],
      explanation: `<strong>Answer:</strong> options 3 and 3. Almost-µP's optimum ratio is about 0.869, and its measured transfer penalty is about 0.0175.`,
    },
    {
      id: "q6", title: "Hyperball across widths", difficulty: "Hard", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> Hyperball projects every linear-layer weight matrix back to its initial Frobenius norm after each Adam-direction step. The course-baseline width sweep uses n/64 heads, feedforward width 3.5n, and the baseline parametrization.</p><p><strong>This question changes.</strong> The width sweep is trained with Hyperball instead of AdamW, at widths n ∈ {128, 256, 512, 1024} and peak LRs η ∈ {.006, .01, .015, .022, .03, .045}.</p>`,
      rows: [
        { id: "q6a", label: "(a) Exponent p in η*(n) = cn^p", options: ["1. (−∞, −.75)", "2. [−.75, −.25)", "3. [−.25, .25)", "4. [.25, ∞)"], correct: 1, exact: 10, adjacent: 5 },
        { id: "q6b", label: "(b) Transfer penalty at width 1024", options: ["1. [0, .005)", "2. [.005, .02)", "3. [.02, .08)", "4. [.08, ∞)"], correct: 2, exact: 10, adjacent: 5 },
      ],
      explanation: `<strong>Answer:</strong> options 2 and 3. The fitted exponent is about −0.561 for seed 42, and the measured transfer penalty at width 1024 is about 0.033.`,
    },
    {
      id: "q7", title: "Scaling LR and WD to batch size 512", difficulty: "Medium", points: 20,
      prompt: `<p><strong>From the assignment (reference only).</strong> At B = 64 and 614.4M tokens, the best reference configuration has peak LR .003, WD .2, and loss 2.9178.</p><p><strong>This question changes.</strong> Batch size B = 512, so training takes eight times fewer updates. Recipes are A: keep both (.003, .2); B: LR × √8 (.00849, .2); C: LR × 8 (.024, .2); D: WD × 8 (.003, 1.6); E: LR × √8 and WD × √8 (.00849, .566).</p>`,
      rows: [
        { id: "q7a", label: "(a) Lowest-loss recipe", options: ["A", "B", "C", "D", "E"], correct: 3, exact: 10, adjacent: 0 },
        { id: "q7b", label: "(b) L_A − min(L_A, …, L_E)", options: ["1. [0, .02)", "2. [.02, .05)", "3. [.05, .15)", "4. [.15, ∞)"], correct: 2, exact: 10, adjacent: 5 },
      ],
      explanation: `<strong>Answer:</strong> recipe D and option 3. Scaling weight decay by 8 gives the lowest loss; the measured cost of keeping the batch-64 pair is about 0.106 at seed 42.`,
    },
  ];

  const form = document.getElementById("quiz-form");
  const container = document.getElementById("quiz-questions");
  const validationError = document.getElementById("quiz-validation-error");
  const results = document.getElementById("quiz-results");
  const scoreElement = document.getElementById("quiz-score");
  const scoreSummary = document.getElementById("quiz-score-summary");
  const resetButton = document.getElementById("reset-quiz");
  const storageKey = "cs312-hyperparameter-scaling-quiz-draft-v1";

  function groupRows(rows) {
    return rows.reduce((groups, row) => {
      const signature = JSON.stringify(row.options);
      const previous = groups.at(-1);
      if (previous && previous.signature === signature) previous.rows.push(row);
      else groups.push({ signature, rows: [row] });
      return groups;
    }, []);
  }

  function renderRowGroup(group) {
    if (group.rows.length === 1) {
      const row = group.rows[0];
      return `<fieldset class="quiz-part" id="row-${row.id}"><legend class="quiz-part-title">${row.label}</legend><div class="quiz-options quiz-options-${row.options.length}">${row.options.map((option, index) => `<label class="quiz-option"><input type="radio" name="${row.id}" value="${index}" required /><span>${option}</span></label>`).join("")}</div></fieldset>`;
    }
    const options = group.rows[0].options;
    return `<div class="quiz-part quiz-table-wrap"><table class="quiz-answer-table"><thead><tr><th scope="col"><span class="quiz-visually-hidden">Question row</span></th>${options.map((option) => `<th scope="col">${option}</th>`).join("")}</tr></thead><tbody>${group.rows.map((row) => `<tr id="row-${row.id}"><th scope="row">${row.label}</th>${row.options.map((option, index) => `<td><label class="quiz-table-choice"><input type="radio" name="${row.id}" value="${index}" required /><span class="quiz-visually-hidden">${row.label}: ${option}</span></label></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function renderQuestion(question, index) {
    return `<section class="quiz-question" id="${question.id}"><div class="quiz-question-heading"><h2>Q${index + 1}. ${question.title}</h2><span class="quiz-points">${question.points} points</span></div><p class="quiz-difficulty">Difficulty: ${question.difficulty}</p><div class="quiz-prompt">${question.prompt}</div>${groupRows(question.rows).map(renderRowGroup).join("")}<div class="quiz-rationale-grid"><label class="quiz-rationale"><span>Assignment problem cited</span><textarea name="${question.id}-citation"></textarea></label><label class="quiz-rationale"><span>Observations from the experiment</span><textarea name="${question.id}-observations"></textarea></label><label class="quiz-rationale"><span>Your rationale</span><textarea name="${question.id}-rationale"></textarea></label></div><div class="quiz-feedback" hidden></div></section>`;
  }

  container.innerHTML = questions.map(renderQuestion).join("");

  function saveDraft() {
    const draft = {};
    new FormData(form).forEach((value, key) => { draft[key] = value; });
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }

  function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!draft) return;
      Object.entries(draft).forEach(([name, value]) => {
        const field = form.elements[name];
        if (!field) return;
        if (field instanceof RadioNodeList) field.value = value;
        else if (field.type === "checkbox") field.checked = value === true || value === "on";
        else field.value = value;
      });
    } catch (_error) { localStorage.removeItem(storageKey); }
  }

  function validateRows() {
    const missing = questions.flatMap((question) => question.rows).filter((row) => form.querySelectorAll(`input[name="${row.id}"]:checked`).length !== 1);
    if (!missing.length) { validationError.hidden = true; validationError.textContent = ""; return true; }
    validationError.textContent = `Select exactly one answer in every row. ${missing.length} ${missing.length === 1 ? "row is" : "rows are"} incomplete.`;
    validationError.hidden = false;
    const first = document.getElementById(`row-${missing[0].id}`);
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    first?.querySelector("input")?.focus({ preventScroll: true });
    return false;
  }

  const formatPoints = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);

  function gradeQuestion(question) {
    let points = 0;
    const details = question.rows.map((row) => {
      const selected = Number(form.elements[row.id].value);
      const earned = selected === row.correct ? row.exact : row.adjacent && Math.abs(selected - row.correct) === 1 ? row.adjacent : 0;
      points += earned;
      return `${row.label}: ${formatPoints(earned)}/${formatPoints(row.exact)} — your answer: ${row.options[selected]}; answer: ${row.options[row.correct]}`;
    });
    return { points, details, status: points === question.points ? "correct" : points > 0 ? "partial" : "incorrect" };
  }

  function renderFeedback(question, grade) {
    const section = document.getElementById(question.id);
    const feedback = section.querySelector(".quiz-feedback");
    feedback.className = `quiz-feedback ${grade.status}`;
    feedback.innerHTML = `<h3>${formatPoints(grade.points)} / ${question.points} points</h3><ul>${grade.details.map((detail) => `<li>${detail}</li>`).join("")}</ul><p>${question.explanation}</p>`;
    feedback.hidden = false;
    section.classList.add("is-graded");
  }

  form.addEventListener("change", saveDraft);
  form.addEventListener("input", saveDraft);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateRows() || !form.reportValidity()) return;
    if (!window.confirm("Submit now and reveal the complete answer key?")) return;
    let total = 0;
    questions.forEach((question) => {
      const grade = gradeQuestion(question);
      total += grade.points;
      renderFeedback(question, grade);
    });
    const percent = Math.round((total / 140) * 100);
    scoreElement.textContent = `${formatPoints(total)} / 140 (${percent}%)`;
    scoreSummary.textContent = "Review the explanations below and compare them with your assignment evidence and rationale.";
    form.querySelectorAll("input, textarea, button[type='submit']").forEach((control) => { control.disabled = true; });
    localStorage.removeItem(storageKey);
    results.hidden = false;
    results.focus();
    results.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  resetButton.addEventListener("click", () => {
    if (!window.confirm("Reset every answer?")) return;
    form.reset();
    form.querySelectorAll("input, textarea, button[type='submit']").forEach((control) => { control.disabled = false; });
    document.querySelectorAll(".quiz-feedback").forEach((feedback) => { feedback.hidden = true; feedback.innerHTML = ""; });
    document.querySelectorAll(".quiz-question").forEach((section) => section.classList.remove("is-graded"));
    results.hidden = true;
    validationError.hidden = true;
    localStorage.removeItem(storageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  restoreDraft();
  if (!window.confirm("The quizzes are best taken after completing the assignment. You are not allowed any external information on these quizzes (model runs, cheat sheets, etc.). Are you sure you want to take the quiz?")) window.location.href = "index.html";
})();
