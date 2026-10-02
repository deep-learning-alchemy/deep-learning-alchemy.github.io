(() => {
  "use strict";

  const questions = [
    {
      id: "q1",
      title: "What normal training noise looks like",
      difficulty: "Easy",
      points: 10,
      prompt: `
        <p>We train the standard recipe at ten paired seeds, setting <code>model_seed = data_seed = s</code>
        for <code>s = 4, …, 13</code>, all on the same GPU type.</p>
        <p>(a) The sample standard deviation √(Σ<sub>i</sub>(x<sub>i</sub> − x̄)²/9) of the ten final validation losses is closest to:</p>
        <p>(b) Define a run's <em>late-training jitter</em> as the standard deviation of (per-step train loss − its centered 51-step running mean), computed over the final 2000 optimizer steps. The average jitter of the ten runs is closest to:</p>`,
      diff: `--- a/experiments/a1_basics/p3_measuring_variation.py
+++ b/experiments/a1_basics/p3_measuring_variation.py
@@
 RUNS = [
-    TrainConfig(deterministic=True, run_name_suffix="deterministic-reference-1"),
-    TrainConfig(deterministic=True, run_name_suffix="deterministic-reference-2"),
+    TrainConfig(model_seed=seed, data_seed=seed, run_name_suffix=f"quiz-s2-seed{seed}")
+    for seed in range(4, 14)
 ]`,
      rows: [
        {
          id: "q1a",
          label: "(a) Sample standard deviation of the ten final validation losses",
          options: ["0.0003", "0.001", "0.003", "0.01", "0.03"],
          correct: 2,
          exact: 5,
          adjacent: 0,
        },
        {
          id: "q1b",
          label: "(b) Average late-training jitter of the ten runs",
          options: ["0.004", "0.013", "0.04", "0.13"],
          correct: 2,
          exact: 5,
          adjacent: 2,
        },
      ],
      scoring: "5 points per part, for the listed value closest in ratio (|log(measured/option)| smallest) to the key runs' value. Part (b) only: 2 points for an adjacent option.",
      explanation: `<strong>Answer:</strong> (a) 0.003; (b) 0.04. Across seeds 4–13, the final-loss sample SD is 0.002915 and mean late-training jitter is 0.0399.`,
    },
    {
      id: "q2",
      title: "Loss-curve microstructure",
      difficulty: "Easy",
      points: 10,
      prompt: `<p>Using the late-training jitter defined in the first question (the standard deviation of per-step train loss minus its centered 51-step running mean, over the final 2000 optimizer steps), we rerun the standard recipe on the same 600,000 sequences at two other batch sizes, next to a standard batch-64 reference.</p><p>For each batch size, check the option closest to the ratio of its jitter to the batch-64 reference run's jitter:</p>`,
      diff: `--- a/experiments/a1_basics/p5_loss_curve_augury.py
+++ b/experiments/a1_basics/p5_loss_curve_augury.py
@@
 RUNS = [
-    TrainConfig(),
+    TrainConfig(run_name_suffix="quiz-q1-standard-reference"),
+    TrainConfig(batch_size=16, run_name_suffix="quiz-q1-batch-size-16"),
+    TrainConfig(batch_size=256, run_name_suffix="quiz-q1-batch-size-256"),
 ]`,
      rows: [
        { id: "q2a", label: "Batch size 16", options: ["×1/4", "×1/2", "×1", "×2", "×4"], correct: 3, exact: 5, adjacent: 2 },
        { id: "q2b", label: "Batch size 256", options: ["×1/4", "×1/2", "×1", "×2", "×4"], correct: 1, exact: 5, adjacent: 2 },
      ],
      scoring: "5 points per run. The correct option is the listed ratio closest (in log ratio) to the key runs' measured jitter ratio. 2 points for answers that are off-by-one.",
      explanation: `<strong>Answer:</strong> batch 16 is ×2; batch 256 is ×1/2. Measured jitters are 0.0769, 0.0404, and 0.0198 for batches 16, 64, and 256, respectively.`,
    },
    {
      id: "q3",
      title: "Skipping warmup",
      difficulty: "Easy",
      points: 10,
      prompt: `<p>Starting from the standard recipe, we remove the learning-rate warmup entirely and keep everything else unchanged.</p><p>Let Δ = L<sub>no warmup</sub> − L<sub>standard</sub> be the difference in final validation loss. Δ falls in:</p>`,
      diff: `--- a/experiments/a1_basics/p1_hyperparameters.py
+++ b/experiments/a1_basics/p1_hyperparameters.py
@@
 RUNS = [
-    TrainConfig(),
+    TrainConfig(run_name_suffix="quiz-s1-standard"),
+    TrainConfig(warmup_percent=0.0, run_name_suffix="quiz-s1-no-warmup"),
 ]`,
      rows: [
        { id: "q3a", label: "Δ falls in", options: ["Δ < 0.01", "0.01 ≤ Δ < 0.04", "0.04 ≤ Δ < 0.15", "0.15 ≤ Δ < 0.5", "Δ ≥ 0.5, or the run diverges"], correct: 2, exact: 10, adjacent: 2 },
      ],
      scoring: "10 points for the interval containing the key runs' Δ; 2 points for an adjacent interval.",
      explanation: `<strong>Answer:</strong> 0.04 ≤ Δ < 0.15. Matched-seed differences are approximately +0.097, +0.111, and +0.094.`,
    },
    {
      id: "q4",
      title: "Trimming the decay phase",
      difficulty: "Medium",
      points: 10,
      prompt: `<p>The <code>wsdX</code> schedule holds the peak learning rate constant after the standard 1% warmup, then decays linearly to zero over only the final fraction X of steps. We run five decay fractions and a default linear reference.</p><p>What is the smallest X whose final validation loss comes within 0.02 of the default linear run's?</p>`,
      diff: `--- a/experiments/a1_basics/p1_hyperparameters.py
+++ b/experiments/a1_basics/p1_hyperparameters.py
@@
 RUNS = [
-    TrainConfig(),
+    TrainConfig(run_name_suffix="quiz-q2-linear-reference"),
+    *(TrainConfig(lr_schedule=f"wsd{x}", run_name_suffix=f"quiz-q2-wsd{x}")
+      for x in [0.02, 0.05, 0.1, 0.2, 0.5]),
 ]`,
      rows: [
        { id: "q4a", label: "Smallest X", options: ["X = 2%", "X = 5%", "X = 10%", "X = 20%", "X = 50%", "none of these"], correct: 3, exact: 10, adjacent: 3 },
      ],
      scoring: "The correct option is the smallest listed X with loss(wsdX) − loss(linear) < 0.02, both losses from the key runs; 3 points for an adjacent option.",
      explanation: `<strong>Answer:</strong> X = 20%. The measured gaps to linear are 0.085, 0.051, 0.030, and 0.009 for X = 2%, 5%, 10%, and 20%.`,
    },
    {
      id: "q5",
      title: "Peak learning rate and warmup",
      difficulty: "Medium",
      points: 15,
      prompt: `<p>We change the peak learning rate and warmup fraction together.</p><p>For each configuration, check the bin containing its final validation loss:</p>`,
      diff: `--- a/experiments/a1_basics/p1_hyperparameters.py
+++ b/experiments/a1_basics/p1_hyperparameters.py
@@
 RUNS = [
-    TrainConfig(),
+    TrainConfig(
+        learning_rate=lr,
+        warmup_percent=wu,
+        run_name_suffix=f"quiz-q3-lr{lr}-warmup{wu}",
+    )
+    for lr, wu in [(0.009, 0.05), (0.027, 0.05), (0.027, 0.2)]
 ]`,
      rows: [
        { id: "q5a", label: "lr 0.009, warmup 5%", options: ["< 2.94", "2.94–3.05", "3.05–3.6", "≥ 3.6 or NaN"], correct: 0, exact: 5, adjacent: 2 },
        { id: "q5b", label: "lr 0.027, warmup 5%", options: ["< 2.94", "2.94–3.05", "3.05–3.6", "≥ 3.6 or NaN"], correct: 1, exact: 5, adjacent: 2 },
        { id: "q5c", label: "lr 0.027, warmup 20%", options: ["< 2.94", "2.94–3.05", "3.05–3.6", "≥ 3.6 or NaN"], correct: 1, exact: 5, adjacent: 2 },
      ],
      scoring: "5 points per row; check the one bin containing the key run's final validation loss (bins are exhaustive; a boundary value belongs to the lower bin); 2 points per row for an adjacent bin.",
      explanation: `<strong>Answer:</strong> &lt; 2.94; 2.94–3.05; 2.94–3.05. The measured losses are approximately 2.9165, 2.9745, and 2.9563.`,
    },
    {
      id: "q6",
      title: "Norm trajectories under schedule and weight decay",
      difficulty: "Medium",
      points: 10,
      prompt: `<p>We train four runs that cross the learning-rate schedule (linear decay or constant) with the weight decay (0.1 or 0.0). Every step, each run logs the total parameter L2 norm and the total pre-clip gradient L2 norm. Predict how these two norms behave over the course of training.</p><p>(a) Let W(t) be the total parameter L2 norm (all weights) at step t. For each run, check where W at the end of training sits relative to its maximum over the whole run.</p><p>(b) Check every run in which the pre-clip gradient norm at least doubles over training (median of the final 10% of steps ≥ 2× median of the first 10%).</p>`,
      diff: `--- a/experiments/a1_basics/p6_activation_gradient_norms.py
+++ b/experiments/a1_basics/p6_activation_gradient_norms.py
@@ -0,0 +1,36 @@
+from metric_logging import AFTER_BACKWARD, MetricLogger
+from modal_train import launch_training_jobs
+from train import TrainConfig
+
+
+def log_weight_and_grad_norms(ctx):
+    # Runs after backward and before gradient clipping, so grad_norm is pre-clip.
+    weight_sq = 0.0
+    grad_sq = 0.0
+    for parameter in ctx.model.parameters():
+        weight_sq = weight_sq + parameter.detach().float().pow(2).sum()
+        if parameter.grad is not None:
+            grad_sq = grad_sq + parameter.grad.detach().float().pow(2).sum()
+    return {"weight_norm": weight_sq**0.5, "grad_norm": grad_sq**0.5}
+
+
+RUNS = [
+    TrainConfig(
+        lr_schedule=schedule,
+        weight_decay=weight_decay,
+        metric_loggers=(
+            MetricLogger(event=AFTER_BACKWARD, fn=log_weight_and_grad_norms),
+        ),
+        run_name_suffix=f"quiz-q4-{schedule}-wd{weight_decay:g}",
+    )
+    for schedule in ["linear", "constant"]
+    for weight_decay in [0.1, 0.0]
+]
+
+
+def main():
+    launch_training_jobs(RUNS)
+
+
+if __name__ == "__main__":
+    main()`,
      rows: [
        { id: "q6a1", label: "(a) Linear schedule, wd 0.1", options: ["At its peak (within 3%)", "3–15% below peak", ">15% below peak"], correct: 1, exact: 1.5, adjacent: 0 },
        { id: "q6a2", label: "(a) Linear schedule, wd 0.0", options: ["At its peak (within 3%)", "3–15% below peak", ">15% below peak"], correct: 0, exact: 1.5, adjacent: 0 },
        { id: "q6a3", label: "(a) Constant schedule, wd 0.1", options: ["At its peak (within 3%)", "3–15% below peak", ">15% below peak"], correct: 0, exact: 1.5, adjacent: 0 },
        { id: "q6a4", label: "(a) Constant schedule, wd 0.0", options: ["At its peak (within 3%)", "3–15% below peak", ">15% below peak"], correct: 0, exact: 1.5, adjacent: 0 },
      ],
      checksLabel: "(b) Check every run in which the pre-clip gradient norm at least doubles",
      checks: [
        { id: "q6b1", label: "Linear schedule, wd 0.1", correct: false, exact: 1 },
        { id: "q6b2", label: "Linear schedule, wd 0.0", correct: false, exact: 1 },
        { id: "q6b3", label: "Constant schedule, wd 0.1", correct: false, exact: 1 },
        { id: "q6b4", label: "Constant schedule, wd 0.0", correct: false, exact: 1 },
      ],
      scoring: "Part (a): 1.5 points per row, the option containing W(end)/maxₜ W(t). Part (b): 1 point per run, checked iff the measured ratio is ≥ 2.",
      explanation: `<strong>Answer:</strong> only linear schedule with wd 0.1 finishes 3–15% below its peak; the other three finish at their peaks. No run's gradient norm doubles.`,
    },
    {
      id: "q7",
      title: "Extrapolating your scaling ladders",
      difficulty: "Hard",
      points: 15,
      prompt: `<p>In Problem 2(a) you trained d4–d9 ladders for four recipes: the baseline (lr 0.003, linear decay), constant lr, dropout 0.2, and lr 0.03. Part (a) takes all four to d16 (16 layers, hidden 1024, 251.7M parameters, the same 614.4M training tokens). Part (b) returns to Problem 2(c) with two ladder-bending interventions at d4 and d9.</p><p>As a reminder, here are the two smallest rungs of your Problem 2(a) ladders (the unmodified Problem 2 starter at its default seeds, 42). Each entry is the recipe's final validation loss minus the baseline's at the same depth:</p><div class="quiz-context-table-wrap"><table class="quiz-context-table"><thead><tr><th scope="col">Recipe</th><th scope="col">d4</th><th scope="col">d6</th></tr></thead><tbody><tr><th scope="row">constant lr</th><td>+0.125</td><td>+0.187</td></tr><tr><th scope="row">dropout 0.2</th><td>+0.156</td><td>+0.161</td></tr><tr><th scope="row">lr 0.03</th><td>+0.023</td><td>+0.056</td></tr></tbody></table></div><p>(a) For each non-baseline recipe, check the interval containing L<sub>d16</sub>(recipe) − L<sub>d16</sub>(baseline).</p><p>(b) For the standard recipe, L(d9) − L(d4) = −0.41. For each intervention, check the interval containing L(d9) − L(d4).</p>`,
      diff: `--- a/experiments/a1_basics/p2_scaling_law_reliability.py
+++ b/experiments/a1_basics/p2_scaling_law_reliability.py
@@ -3,27 +3,31 @@ from model_config import depth_model_config
 from train import TrainConfig
 
-RUNS = []
-seen_configs = set()
-for depth in range(4, 10):
-    for learning_rate, lr_schedule, dropout in [
-        (0.003, "linear", 0.0),
-        (0.003, "constant", 0.0),
-        (0.003, "linear", 0.2),
-        (0.03, "linear", 0.0),
-    ]:
-        config_key = (depth, learning_rate, lr_schedule, dropout)
-        if config_key in seen_configs:
-            continue
-        seen_configs.add(config_key)
-        RUNS.append(
-            TrainConfig(
-                model_config=depth_model_config(depth),
-                learning_rate=learning_rate,
-                lr_schedule=lr_schedule,
-                dropout=dropout,
-            )
-        )
+# Problem 2(a)'s four recipes at d16 (compiled, one micro-batch: needs an
+# 80 GB GPU such as Modal's default H100).
+P2A_RECIPES = {
    "base": {},
    "constant": {"lr_schedule": "constant"},
    "dropout0.2": {"dropout": 0.2},
    "lr0.03": {"learning_rate": 0.03},
}
+# Two Problem 2(c)-style interventions at d4 and d9.
+P2C_INTERVENTIONS = {
    "epochs8": {"num_train_sequences": 75_000, "num_epochs": 8.0},
    "noqknorm-lr0.006": {"qk_norm": False, "learning_rate": 0.006},
}
+RUNS = [
    TrainConfig(model_name="d16", run_name_suffix=f"quiz-q5-d16-{name}", **changes)
    for name, changes in P2A_RECIPES.items()
] + [
    TrainConfig(
        model_config=depth_model_config(depth),
        run_name_suffix=f"quiz-q5-{name}-d{depth}",
        **changes,
    )
    for name, changes in P2C_INTERVENTIONS.items()
    for depth in [4, 9]
]
 # TODO: Add your own slope-bending and scaling-law-breaking interventions for`,
      rows: [
        { id: "q7a1", label: "(a) d16 gap: constant lr", options: ["< 0", "0–0.08", "0.08–0.18", "0.18–0.4", "≥ 0.4 or diverges"], correct: 3, exact: 3, adjacent: 1.5 },
        { id: "q7a2", label: "(a) d16 gap: dropout 0.2", options: ["< 0", "0–0.08", "0.08–0.18", "0.18–0.4", "≥ 0.4 or diverges"], correct: 1, exact: 3, adjacent: 1.5 },
        { id: "q7a3", label: "(a) d16 gap: lr 0.03", options: ["< 0", "0–0.08", "0.08–0.18", "0.18–0.4", "≥ 0.4 or diverges"], correct: 2, exact: 3, adjacent: 1.5 },
        { id: "q7b1", label: "(b) 8 epochs over the first 75,000 sequences", options: ["< −0.25", "−0.25 to 0", "0 to +0.5", "> +0.5"], correct: 1, exact: 3, adjacent: 1.5 },
        { id: "q7b2", label: "(b) no QK-norm, lr 0.006", options: ["< −0.25", "−0.25 to 0", "0 to +0.5", "> +0.5"], correct: 3, exact: 3, adjacent: 1.5 },
      ],
      scoring: "3 points per row (five rows), for the interval containing the key runs' difference (bins exhaustive; a boundary value belongs to the lower interval; a non-finite loss counts as the last interval); 1.5 points per row for an adjacent interval.",
      explanation: `<strong>Answer:</strong> (a) constant lr 0.18–0.4; dropout 0.2 0–0.08; lr 0.03 0.08–0.18. (b) 8 epochs −0.25 to 0; no QK-norm above +0.5. Measured d16 gaps are about +0.244, +0.058, and +0.122; intervention differences are −0.226 and +0.608.`,
    },
    {
      id: "q8",
      title: "One flipped token",
      difficulty: "Hard",
      points: 15,
      prompt: `<p>With full determinism enabled by the patch below, two runs that differ in exactly one token of one training sequence (one token of 614.4M, position 100 of the first sequence of step 0's batch changed to token ID 17) are compared step-by-step against each other. We do this across five paired seeds s ∈ {42, 43, 44, 45, 46}, setting both the model seed and the data seed to s, and average the measured quantities over those five pairs. We do this twice: once at the standard recipe, and once with only the learning rate raised.</p><p>(a) For each pair, take the peak over training steps of the per-step |Δ train loss| between the two runs. At lr 0.009, the five-seed average of this peak is:</p><p>(b) Let σ be the seed-to-seed standard deviation of final validation loss at the standard recipe (the quantity in part (a) of the first question). At the standard recipe, the five-seed average of the final |Δ val| between paired runs is:</p>`,
      diff: `--- a/experiments/a1_basics/p4_amplification.py
+++ b/experiments/a1_basics/p4_amplification.py
@@ -3,8 +3,17 @@ from train import TrainConfig
 RUNS = [
-    TrainConfig(deterministic=True),
-    TrainConfig(deterministic=True, perturb_one_token=True),
+    TrainConfig(
        deterministic=True,
        model_seed=seed,
        data_seed=seed,
        learning_rate=learning_rate,
        perturb_one_token=(role == "one-token-edit"),
        run_name_suffix=f"quiz-q6-seed{seed}-{regime}-{role}",
+    )
+    for seed in [42, 43, 44, 45, 46]
+    for regime, learning_rate in [("standard", 0.003), ("lr0.009", 0.009)]
+    for role in ["reference", "one-token-edit"]
]`,
      rows: [
        { id: "q8a", label: "(a) Five-seed mean peak |Δ train loss| at lr 0.009", options: ["< 2×10⁻²", "2×10⁻²–2×10⁻¹", "> 2×10⁻¹"], correct: 1, exact: 7.5, adjacent: 0 },
        { id: "q8b", label: "(b) Five-seed mean final |Δ val| at the standard recipe", options: ["Less than 0.2 σ", "Between 0.2 σ and 5 σ", "More than 5 σ"], correct: 1, exact: 7.5, adjacent: 0 },
      ],
      scoring: "Part (a): 7.5 points. Part (b): 7.5 points. In each part the intervals are exhaustive and non-overlapping (boundaries belong to the left interval), and the correct option is the interval containing the measured five-seed average.",
      explanation: `<strong>Answer:</strong> (a) 2×10⁻²–2×10⁻¹; (b) between 0.2σ and 5σ. The measured means are 0.095 for peak |Δ train| and 0.57σ for final |Δ val|.`,
    },
  ];

  const form = document.getElementById("quiz-form");
  const questionsContainer = document.getElementById("quiz-questions");
  const results = document.getElementById("quiz-results");
  const scoreElement = document.getElementById("quiz-score");
  const scoreSummary = document.getElementById("quiz-score-summary");
  const resetButton = document.getElementById("reset-quiz");
  const validationError = document.getElementById("quiz-validation-error");
  const storageKey = "cs312-basics-quiz-draft-v1";

  const formatPoints = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function renderDiff(diff) {
    return diff
      .split("\n")
      .map((line) => {
        let className = "quiz-diff-line";
        if (line.startsWith("+++ ") || line.startsWith("--- ")) {
          className += " quiz-diff-file";
        } else if (line.startsWith("+")) {
          className += " quiz-diff-add";
        } else if (line.startsWith("-")) {
          className += " quiz-diff-remove";
        } else if (line.startsWith("@@")) {
          className += " quiz-diff-hunk";
        }
        return `<span class="${className}">${escapeHtml(line) || " "}</span>`;
      })
      .join("");
  }

  function renderOption(row, option, index) {
    return `
      <label class="quiz-option">
        <input type="radio" name="${row.id}" value="${index}" required />
        <span>${option}</span>
      </label>`;
  }

  function groupRows(rows) {
    return rows.reduce((groups, row) => {
      const previous = groups.at(-1);
      const signature = JSON.stringify(row.options);
      if (previous && previous.signature === signature) {
        previous.rows.push(row);
      } else {
        groups.push({ signature, rows: [row] });
      }
      return groups;
    }, []);
  }

  function renderRowGroup(group) {
    if (group.rows.length === 1) {
      const row = group.rows[0];
      return `
        <fieldset class="quiz-part" id="row-${row.id}">
          <legend class="quiz-part-title">${row.label}</legend>
          <div class="quiz-options quiz-options-${row.options.length}">${row.options.map((option, index) => renderOption(row, option, index)).join("")}</div>
        </fieldset>`;
    }

    const options = group.rows[0].options;
    return `
      <div class="quiz-part quiz-table-wrap">
        <table class="quiz-answer-table">
          <thead>
            <tr>
              <th scope="col"><span class="quiz-visually-hidden">Question row</span></th>
              ${options.map((option) => `<th scope="col">${option}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${group.rows
              .map(
                (row) => `
                  <tr id="row-${row.id}">
                    <th scope="row">${row.label}</th>
                    ${row.options
                      .map(
                        (option, index) => `
                          <td>
                            <label class="quiz-table-choice">
                              <input type="radio" name="${row.id}" value="${index}" required />
                              <span class="quiz-visually-hidden">${row.label}: ${option}</span>
                            </label>
                          </td>`,
                      )
                      .join("")}
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  }

  function renderQuestion(question, number) {
    const rows = groupRows(question.rows).map(renderRowGroup).join("");

    const checks = question.checks
      ? `
        <fieldset class="quiz-part">
          <legend class="quiz-part-title">${question.checksLabel}</legend>
          <div class="quiz-options quiz-options-${question.checks.length}">
            ${question.checks
              .map(
                (check) => `
                  <label class="quiz-check-option">
                    <input type="checkbox" name="${check.id}" />
                    <span>${check.label}</span>
                  </label>`,
              )
              .join("")}
          </div>
        </fieldset>`
      : "";

    return `
      <section class="quiz-question" id="${question.id}">
        <div class="quiz-question-heading">
          <h2>Q${number + 1}. ${question.title}</h2>
          <span class="quiz-points">${question.points} points</span>
        </div>
        <p class="quiz-difficulty">${question.difficulty}</p>
        <div class="quiz-prompt">${question.prompt}</div>
        <details class="quiz-diff">
          <summary>View experiment diff</summary>
          <pre><code>${renderDiff(question.diff)}</code></pre>
        </details>
        ${rows}
        ${checks}
        <label class="quiz-rationale">
          <span>Reasoning <small>Write 2–3 lines of reasoning that cite your assignment's experiments. Not auto-graded online.</small></span>
          <textarea name="${question.id}-rationale" placeholder="Write 2–3 lines of reasoning…"></textarea>
        </label>
        <p class="quiz-scoring-note"><strong>Scoring:</strong> ${question.scoring}</p>
        <div class="quiz-feedback" hidden></div>
      </section>`;
  }

  questionsContainer.innerHTML = questions.map(renderQuestion).join("");

  function saveDraft() {
    const draft = {};
    new FormData(form).forEach((value, key) => {
      draft[key] = value;
    });
    questions.flatMap((question) => question.checks || []).forEach((check) => {
      draft[check.id] = form.elements[check.id].checked;
    });
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }

  function restoreDraft() {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const draft = JSON.parse(stored);
      Object.entries(draft).forEach(([name, value]) => {
        const fields = form.elements[name];
        if (!fields) return;
        if (fields instanceof RadioNodeList) {
          fields.value = value;
        } else if (fields.type === "checkbox") {
          fields.checked = value === true || value === "on";
        } else {
          fields.value = value;
        }
      });
    } catch (_error) {
      localStorage.removeItem(storageKey);
    }
  }

  function gradeRow(row) {
    const selected = Number(form.elements[row.id].value);
    if (selected === row.correct) return { points: row.exact, status: "correct", selected };
    if (row.adjacent && Math.abs(selected - row.correct) === 1) {
      return { points: row.adjacent, status: "partial", selected };
    }
    return { points: 0, status: "incorrect", selected };
  }

  function validateSingleChoiceRows() {
    const invalidRows = questions
      .flatMap((question) => question.rows)
      .filter((row) => form.querySelectorAll(`input[name="${row.id}"]:checked`).length !== 1);

    if (invalidRows.length === 0) {
      validationError.hidden = true;
      validationError.textContent = "";
      return true;
    }

    validationError.textContent = `Select exactly one answer in each single-choice row. ${invalidRows.length} ${invalidRows.length === 1 ? "row is" : "rows are"} incomplete.`;
    validationError.hidden = false;
    const firstInvalidRow = document.getElementById(`row-${invalidRows[0].id}`);
    firstInvalidRow?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalidRow?.querySelector("input")?.focus({ preventScroll: true });
    return false;
  }

  function gradeQuestion(question) {
    let points = 0;
    const details = question.rows.map((row) => {
      const result = gradeRow(row);
      points += result.points;
      return `${row.label}: ${formatPoints(result.points)}/${formatPoints(row.exact)} — your answer: ${row.options[result.selected]}; answer: ${row.options[row.correct]}`;
    });

    (question.checks || []).forEach((check) => {
      const selected = form.elements[check.id].checked;
      const earned = selected === check.correct ? check.exact : 0;
      points += earned;
      details.push(`${check.label}: ${formatPoints(earned)}/${formatPoints(check.exact)} — ${selected ? "checked" : "not checked"}; answer: ${check.correct ? "checked" : "not checked"}`);
    });

    const status = points === question.points ? "correct" : points > 0 ? "partial" : "incorrect";
    return { points, details, status };
  }

  function renderFeedback(question, grade) {
    const section = document.getElementById(question.id);
    const feedback = section.querySelector(".quiz-feedback");
    feedback.className = `quiz-feedback ${grade.status}`;
    feedback.innerHTML = `
      <h3>${formatPoints(grade.points)} / ${question.points} points</h3>
      <ul>${grade.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>
      <p>${question.explanation}</p>`;
    feedback.hidden = false;
    section.classList.add("is-graded");
  }

  form.addEventListener("change", saveDraft);
  form.addEventListener("change", () => {
    if (!validationError.hidden) validateSingleChoiceRows();
  });
  form.addEventListener("input", saveDraft);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateSingleChoiceRows()) return;
    if (!form.reportValidity()) return;
    if (!window.confirm("Submit now and reveal the complete answer key?")) return;

    let total = 0;
    questions.forEach((question) => {
      const grade = gradeQuestion(question);
      total += grade.points;
      renderFeedback(question, grade);
    });

    const percent = Math.round((total / 95) * 100);
    scoreElement.textContent = `${formatPoints(total)} / 95 (${percent}%)`;
    scoreSummary.textContent = total >= 76
      ? "Strong outcome prediction. Review any partial-credit rows and compare your rationale to the evidence."
      : total >= 47.5
        ? "This is within the expected range for a deliberately difficult quiz. Focus on the explanations for the largest misses."
        : "This quiz is intentionally difficult. Use the explanations to decide which experiments to revisit before retaking it.";
    results.hidden = false;
    form.querySelectorAll("input, textarea, button[type='submit']").forEach((control) => {
      control.disabled = true;
    });
    localStorage.removeItem(storageKey);
    results.focus();
    results.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  resetButton.addEventListener("click", () => {
    if (!window.confirm("Reset every answer and hide the answer key?")) return;
    form.reset();
    form.querySelectorAll("input, textarea, button[type='submit']").forEach((control) => {
      control.disabled = false;
    });
    document.querySelectorAll(".quiz-feedback").forEach((feedback) => {
      feedback.hidden = true;
      feedback.innerHTML = "";
    });
    document.querySelectorAll(".quiz-question").forEach((section) => section.classList.remove("is-graded"));
    results.hidden = true;
    validationError.hidden = true;
    validationError.textContent = "";
    localStorage.removeItem(storageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  restoreDraft();
  const shouldBeginQuiz = window.confirm(
    "The quizzes are best taken after completing the assignment. You are not allowed any external information on these quizzes (model runs, cheat sheets, etc.). Are you sure you want to take the quiz?",
  );
  if (!shouldBeginQuiz) window.location.href = "index.html";
})();
