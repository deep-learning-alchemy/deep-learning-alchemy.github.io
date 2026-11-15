(() => {
  "use strict";

  const tex = String.raw;
  const letters4 = ["A", "B", "C", "D"];
  const comparisons = ["&lt;", "=", "&gt;"];
  const figure = (name, alt) => `<a href="assets/quizzes/capacity_${name}.png" target="_blank" rel="noopener" title="Open figure at full size"><img class="quiz-prompt-image" src="assets/quizzes/capacity_${name}.png" alt="${alt}" /></a>`;
  const table = (headings, rows) => `<div class="quiz-context-table-wrap quiz-context-table-wide"><table class="quiz-context-table"><thead><tr>${headings.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${row[0]}</th>${row.slice(1).map(v => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const questions = [
    {
      id: "q1", title: "Loss comparisons", difficulty: "Easy", points: 12,
      prompt: tex`<p>Use the depth/width comparison from A5 Problem 1. “Normal” means $W/D=64$; multipliers change this ratio at roughly the d8 parameter budget (34.6M).</p><h3>Lightning round (12 points; 3 per row).</h3><p>Effect of width and depth on loss at a fixed parameter budget.</p><p>Write &lt;, = or &gt; in each box to compare the models’ validation losses; lower loss is better. Train every shape from scratch with peak LR .003, using the reference recipe. Treat gaps below .02 NLL as ties.</p>` + table(["Model", "$D$", "$W$", "$W/D$", "Parameters (M)"], [
        ["Super wide", 1, 1280, "1280.0", "34.247"],
        ["8 × normal ratio", 2, 960, "480.0", "34.596"],
        ["2 × normal ratio", 5, 640, "128.0", "34.947"],
        ["Normal", 8, 512, "64.0", "34.613"],
        ["½ × normal ratio", 13, 416, "32.0", "36.041"],
        ["⅛ × normal ratio", 34, 256, "7.5", "34.428"],
        ["Super narrow", 62, 192, "3.1", "34.746"],
      ]) + `<p>Shapes are rounded to match the parameter budget; actual ratios and counts are shown above.</p>`,
      rows: [
        { id: "q1a", label: "(a) Super narrow vs. Super wide", options: comparisons, correct: 0, exact: 3 },
        { id: "q1b", label: "(b) ½ × normal aspect ratio vs. 2 × normal aspect ratio", options: comparisons, correct: 1, exact: 3 },
        { id: "q1c", label: "(c) ⅛ × normal aspect ratio vs. 8 × normal aspect ratio", options: comparisons, correct: 0, exact: 3 },
        { id: "q1d", label: "(d) Super narrow vs. Normal", options: comparisons, correct: 2, exact: 3 },
      ],
      explanation: `<p><strong>Answer:</strong> (a) &lt;; (b) =; (c) &lt;; (d) &gt;.</p><p>Super narrow: 3.0173; super wide: 3.4325; normal: 2.9318. D13/W416: 2.9473 versus D5/W640: 2.9526, a tie under .02 NLL. D34/W256: 2.9587 versus D2/W960: 3.0771.</p><p>Equal stored parameters do not imply equal readout width, sequential computation or optimization. Very shallow/wide models underperformed the normal and narrow references at this budget. Neither a blanket “more width is better” nor “more depth is better” rule matches all these comparisons.</p>`,
    },
    {
      id: "q2", title: "Looping", difficulty: "Easy", points: 20, rationaleParts: ["(a)", "(b)"],
      prompt: `<h3>(a) More passes at inference (10 points).</h3><p>Effect of inference pass count on validation loss.</p><p>Use A5’s prelude–shared core–coda models, each executing eight layers during training:</p>` + table(["Model", "Core blocks", "Training passes $R$"], [["Two-pass", 3, 2], ["Three-pass", 2, 3], ["Six-pass", 1, 6]]) + tex`<p>Share all core parameters. After every pass, including the last, apply $h \leftarrow \operatorname{RMSNorm}(h)+h_{\mathrm{prelude}}$ with non-affine RMSNorm.</p><p>Use peak LR .003 for all three models. Keep each trained checkpoint fixed while varying inference passes. Evaluate $m\in\{1,R,R+1,2R\}$ passes on the same held-out inputs without changing weights or the boundary map. Which plot best shows loss? The x-axis is evaluation passes divided by training passes, $m/R$.</p>` + figure("q2a", "Four alternative plots A through D showing validation loss against evaluation passes divided by training passes, for two-pass, three-pass and six-pass models."),
      rows: [
        { id: "q2a", label: "(a) Inference passes", options: letters4, correct: 0, exact: 10 },
        { id: "q2b", label: "(b) Growing a loop", options: [tex`A. $L_{\mathrm{grow}}\ge L_{\mathrm{loop}}$: as bad as or worse than keeping the loop.`, tex`B. $M\le L_{\mathrm{grow}}<L_{\mathrm{loop}}$: between the baselines, closer to Loop (or exactly midway).`, tex`C. $L_{\mathrm{dense}}\le L_{\mathrm{grow}}<M$: between the baselines, closer to Dense.`, tex`D. $L_{\mathrm{grow}}<L_{\mathrm{dense}}$: better than training dense throughout.`], correct: 2, exact: 10, layout: "stacked",
          before: tex`<h3>(b) Growing a looped model (10 points).</h3><p>Effect of unsharing a loop halfway through training on final loss.</p><p>Use the <strong>plain</strong> six-pass model (no extra boundary RMS or recall). All three plans use peak LR .003, and the reference token budget:</p><ul><li><strong>Loop:</strong> keep the shared block throughout.</li><li><strong>Grow:</strong> halfway through training, clone the shared block into six independently trainable copies and continue.</li><li><strong>Dense:</strong> train standard d8 with independent blocks throughout.</li></ul><p>All reset Adam halfway and keep the data and LR clocks. Growth leaves the other weights unchanged. All execute eight layers throughout. Given $L_{\mathrm{dense}}<L_{\mathrm{loop}}$ and $M=(L_{\mathrm{dense}}+L_{\mathrm{loop}})/2$, where does $L_{\mathrm{grow}}$ fall?</p>`,
        },
      ],
      explanation: `<p><strong>Answer:</strong> (a) A; (b) C.</p>` + table(["Training passes", "$m=1$", "$m=R$", "$m=R+1$", "$m=2R$"], [[2,"3.1103","2.9510","2.9684","2.9851"],[3,"3.2895","2.9740","2.9928","3.0066"],[6,"3.4645","3.0149","3.0350","3.0275"]]) + `<p>Only A is measured; the alternatives are constructed. Loss generally rises beyond the trained pass count.</p><p>Dense throughout: 2.9333; Grow halfway: 2.9805; Loop throughout: 3.0538. The midpoint is 2.9935. Cloning preserves the forward function immediately, but the copies then receive different occurrence gradients. Growing improves on continuing the loop and ends closer to Dense, while dense training from initialization still wins here.</p>`,
    },
    {
      id: "q3", title: "Low-rank bottleneck", difficulty: "Medium", points: 16, rationaleParts: ["(a) Rank 64", "(a) Rank 1280", "(b) Rank matching"],
      prompt: tex`<p>Use A5 Problem 2’s Softmax, Sigsoftmax, MoS-4 and CPLM. Rank refers to the vocabulary head (per component for MoS); CPLM’s copy branch stays unrestricted.</p><h3>(a) Interventions on two wide models (6 points).</h3><p>Effect of readout interventions with and without a rank-64 bottleneck.</p><p>Compare two versions of Q1’s <strong>super wide</strong> $D=1,W=1280$ model:</p><ul><li><strong>Wide:</strong> the full-rank vocabulary head ($r=1280$).</li><li><strong>Wide + rank-64 bottleneck:</strong> the same backbone with an induced rank-64 vocabulary-head bottleneck.</li></ul><p>Use peak LR .003 for all methods; extra head parameters are allowed. For each model, compare Sigsoftmax, MoS-4 and CPLM to <strong>its own Softmax baseline</strong>. Write &lt;, = or &gt; in each box to compare the method’s validation loss (left) with its same-rank Softmax loss (right). Gaps below .02 NLL count as equal (six comparisons, 1 point each).</p>`,
      rows: [
        { id: "q3a1", label: "Sigsoftmax, rank 64", method: "Sigsoftmax", matrix: true, options: comparisons, correct: 1, exact: 1 },
        { id: "q3a2", label: "Sigsoftmax, rank 1280", matrix: true, options: comparisons, correct: 1, exact: 1 },
        { id: "q3a3", label: "MoS-4, rank 64", method: "MoS-4", matrix: true, options: comparisons, correct: 0, exact: 1 },
        { id: "q3a4", label: "MoS-4, rank 1280", matrix: true, options: comparisons, correct: 1, exact: 1 },
        { id: "q3a5", label: "CPLM, rank 64", method: "CPLM", matrix: true, options: comparisons, correct: 0, exact: 1 },
        { id: "q3a6", label: "CPLM, rank 1280", matrix: true, options: comparisons, correct: 0, exact: 1 },
        { id: "q3b", label: "(b) Closest rank", options: ["A. Rank 64", "B. Rank 128", "C. Rank 256", "D. Rank 512"], correct: 1, exact: 10,
          before: tex`<h3>(b) Matching the bottleneck rank (10 points).</h3><p>Loss of rank-64 MoS-4 relative to the Softmax rank ladder.</p><p>Use the same <strong>wide $D=1,W=1280$</strong> backbone on natural DCLM text. The plot shows Softmax heads with bottleneck ranks 64, 128, 256 and 512; the backbone architecture stays fixed. Train every model from scratch at peak LR .003, seed 42 and the full reference token budget, measuring final loss on the full validation set.</p><p>Replace the rank-64 Softmax head with <strong>MoS-4, rank 64 per component</strong>. Which Softmax bottleneck rank has the <strong>closest final validation loss</strong> to this model?</p>` + figure("q3b", "Softmax final validation loss plotted against bottleneck ranks 64, 128, 256 and 512 for a fixed wide D1/W1280 backbone."),
        },
      ],
      explanation: `<p><strong>Answer:</strong> (a) Rank 64: =, &lt;, &lt;; rank 1280: =, =, &lt; (Sigsoftmax, MoS-4, CPLM). (b) B, rank 128.</p>` + table(["Rank", "Softmax", "Sigsoftmax", "MoS-4", "CPLM"], [[64,"3.6619","3.6672","3.5514","3.3988"],[1280,"3.4325","3.4309","3.4428","3.2415"]]) + `<p>Sigsoftmax ties Softmax at both ranks. MoS-4 improves rank 64 and ties at rank 1280 under the .02 rule. CPLM improves both. Extra head parameters and compute are allowed.</p><p>Rank-64 MoS-4 has NLL 3.551373. Softmax ranks 64, 128, 256 and 512 have losses 3.661947, 3.565801, 3.507975 and 3.479950. Rank 128 is closest. This is an empirical loss match, not formal rank equivalence.</p>`,
    },
    {
      id: "q4", title: "MoE routing methods", difficulty: "Medium", points: 18, rationaleParts: ["(a)", "(b)"],
      prompt: tex`<p>Use A5 Problem 3’s d8 MoE: four full-size experts per MLP, top-1 routing and $4p_{e^*}$ combine weights, except where stated. This stores more parameters than dense d8. Treat each package as a separate recipe. Letters A–D are defined independently in (a) and (b).</p><h3>(a) Basic router packages (8 points).</h3><p>Validation-loss comparison of the basic router packages.</p><p>Use peak LR .003 for all four.</p>` + table(["Package", "Intervention"], [["A", "Random top-1: independent uniform routing per token/application; unit combine weight."],["B", "Frozen top-1: hold a random router matrix fixed; train the backbone and experts."],["C", "Learned top-1: train the router, without a balancing loss."],["D", "Dense: standard d8."]]) + `<p>Write the <strong>full ranking</strong> of final validation losses, using each package letter once and the symbols &lt;, &gt; and =. Here &lt; means lower loss, &gt; means higher loss, and = means a tie (gap below .01 NLL).</p>`,
      rows: [
        { id: "q4a", kind: "ranking", label: "(a) Ranking (A–D)", exact: 8, correctRanks: { A: 2, B: 0, C: 0, D: 1 } },
        { id: "q4b", label: "(b) Lowest loss", options: letters4, correct: 1, exact: 10, credits: [3, 10, 3, 0],
          before: tex`<h3>(b) Improving the router (10 points).</h3><p>Validation-loss comparison of the router interventions.</p><p>Choose the package with the lowest final validation loss. Each package starts from the standard learned top-1 router and applies only its own listed intervention. All four use top-1 dispatch. A–C keep the standard combine weights; D replaces $4p_{e^*}$ by 1 in training and evaluation. For every package, test peak LRs $\{.001,.002,.003,.0045,.006,.009,.0135\}$. Use each package’s lowest final validation loss.</p><p>Short English descriptions of these algorithms appear beside the corresponding diff in Appendix A.4.</p>` + table(["Package", "Intervention"], [["A", "Cloned expert initialization"],["B", "Auxiliary load balancing ($\\lambda=.01$)"],["C", "Quantile load balancing"],["D", "Remove probability combine weight (use weight 1)"]]) + `<p>Select only one choice. Credit: best/second/third/fourth = 10/3/3/0 points.</p><details class="quiz-diff"><summary>Router interventions (Appendix A.4)</summary><div class="quiz-intervention-notes"><p><strong>A — cloned experts.</strong> Copy one expert’s initial weights to all four experts. They then train independently; their weights are not tied.</p><p><strong>B — auxiliary load balancing.</strong> Add a loss with coefficient .01 that couples each expert’s token share to its mean routing probability, encouraging a more even allocation of tokens.</p><p><strong>C — quantile load balancing.</strong> After each optimizer step, use score quantiles pooled across its microbatches to set expert biases for the next step, targeting an equal token share. These biases affect dispatch only; combine weights still use the original router probabilities.</p><p><strong>D — unit combine weight.</strong> Keep the top-1 expert selection, but replace the selected expert’s output multiplier by 1 during training and evaluation.</p></div></details>`,
        },
      ],
      explanation: `<p><strong>Answer:</strong> (a) C = B &lt; D &lt; A: Learned = Frozen &lt; Dense &lt; Random. Equivalent chains, including A &gt; D &gt; B = C, earn full credit. (b) B.</p><p>In (a), losses are A: 3.0818, B: 2.8917, C: 2.8916, D: 2.9318. The frozen and learned routers tie under .01 NLL. A frozen input-dependent router is not a fresh uniform random draw at each application; experts and backbone still learn around it. This is not a fixed-parameter-budget comparison.</p><p>In (b), LR-selected losses are A: 2.9140, B: 2.8690, C: 2.8940, D: 2.9456. B earns 10 points; A and C earn 3 each; D earns 0. Every package uses the same seven-LR grid, seed 42 and full token budget. The ranking is specific to this recipe and selection procedure.</p>`,
    },
    {
      id: "q5", title: "Router metrics across layers", difficulty: "Hard", points: 16, rationaleParts: ["(a)", "(b)"],
      prompt: tex`<h3>(a) Expert-load CV across layers (8 points).</h3><p>Variation in expert-load CV across layers.</p><p>Use a <strong>plain learned top-1 router</strong> with no balancing, native $4p_{e^*}$ combine weights and peak LR .006, measured on A5’s first eight validation sequences and first 128 positions. For selected expert counts $n_{\ell,e}$, use $\mathrm{CV}_\ell=\operatorname{std}_e(n_{\ell,e})/\operatorname{mean}_e(n_{\ell,e})$ with population standard deviation. Which plot best shows $\mathrm{CV}_\ell$ across layers?</p>` + figure("q5a", "Four alternative plots A through D of expert-load coefficient of variation against layer, measured over four experts."),
      rows: [
        { id: "q5a", label: "(a) Expert-load CV", options: letters4, correct: 2, exact: 8 },
        { id: "q5b", label: "(b) Router entropy", options: letters4, correct: 3, exact: 8,
          before: tex`<h3>(b) Router entropy across layers (8 points).</h3><p>Variation in router entropy across layers.</p><p>Reuse (a)’s checkpoint trained at peak LR .006 and the same held-out inputs, with no further training or LR selection. At each layer, average the per-token entropy across all four router probabilities:</p><p>$H_\ell=-\frac{1}{T\log 4}\sum_{t=1}^{T}\sum_{e=1}^{4}p_{\ell,t,e}\log p_{\ell,t,e}$.</p><p>This is 1 for uniform probabilities and 0 for one-hot probabilities. Which plot best matches the trained model? Judge the broad depth pattern, rather than individual wiggles.</p>` + figure("q5b", "Four alternative plots A through D of normalized mean per-token router entropy across layers."),
        },
      ],
      explanation: `<p><strong>Answer:</strong> (a) C; (b) D.</p><p>Expert-load CV by layer: 1.730, 0.152, 0.706, 1.604, 1.284, 1.640, 0.824, 1.732. Layers 1 and 8 nearly collapse to one expert, while layer 2 is much better balanced. The pattern is not monotonic.</p><p>Entropy by layer: 0.620, 0.760, 0.655, 0.808, 0.559, 0.345, 0.396, 0.130. It is relatively high in early/middle layers, then falls in later layers, without strict monotonicity.</p><p>Aggregate expert utilization and per-token confidence measure different things. Lower entropy indicates sharper probabilities, not necessarily better routing or useful specialization. Both plots use the same checkpoint and held-out inputs.</p>`,
    },
    {
      id: "q6", title: "Allocating capacity between loops and experts", difficulty: "Hard", points: 8,
      prompt: `<p>Best recipe for fixed unique parameter count and inference FLOPs.</p><p>Use at most <strong>dense d8’s unique parameter count and inference FLOPs</strong>, ignoring the small routing overhead. Every recipe has width 512, a <strong>dense prelude and coda</strong>, and eight block applications. Repeat the middle core as shown, sharing all core parameters across passes.</p>` + table(["Package", "Passes", "Core blocks", "Experts per core block", "Unique params (M)"], [["A",6,1,6,"29.37"],["B",3,2,3,"30.42"],["C",2,3,2,"31.47"],["D",1,6,1,"34.61"]]) + tex`<p>We swept peak LR over $\{.001,.002,.003,.0045,.006,.009\}$ for each package, using seed 42 and the full reference token budget.</p><p>Which package achieves the <strong>lowest selected validation loss</strong>?</p>`,
      rows: [{ id: "q6a", label: "Lowest loss after LR selection", options: letters4, correct: 3, exact: 8 }],
      explanation: `<p><strong>Answer:</strong> D. Loss order: D &lt; C &lt; B &lt; A.</p><p>LR-selected final losses: A: 2.983593, B: 2.975187, C: 2.955496, D: 2.932391. All four select peak LR .003. Dense D leads the runner-up by 0.023105 NLL.</p><p>All recipes have dense prelude/coda, plain looping and learned top-1 routing with no auxiliary loss. They fit both resource caps, with eight block applications throughout. This is a single-seed recipe ranking, not a universal optimum.</p>`,
    },
  ];

  const appendix = {
  "q1": "--- /dev/null\n+++ b/experiments/a5_capacity/quiz_recipes.py\n@@ -0,0 +1,9 @@\n+\"\"\"Quiz recipes: small changes to the released A5 implementation.\"\"\"\n+from dataclasses import replace\n+\n+\n+def q1_configs():\n+    from .sweeps import config\n+    shapes = {'normal': (8, 512), 'narrow': (62, 192), 'wide': (1, 1280),\n+              'half': (13, 416), 'twice': (5, 640), 'eighth': (34, 256), 'eight': (2, 960)}\n+    return {name: config('dense', .003, depth=d, width=w) for name, (d, w) in shapes.items()}",
  "q2": "--- /dev/null\n+++ b/experiments/a5_capacity/quiz_recipes.py\n@@ -0,0 +1,27 @@\n+\"\"\"Quiz recipes: small changes to the released A5 implementation.\"\"\"\n+from dataclasses import replace\n+\n+\n+def q2_configs():\n+    from .sweeps import config\n+    output = {}\n+    for passes in (2, 3, 6):\n+        output[f'passes-{passes}'] = config('dense', .003,\n+            model_builder='experiments.a5_capacity.p4_looping:LoopLM',\n+            model_builder_kwargs=dict(passes=passes, boundary_norm=True, recall=1.))\n+    for name in ('loop-reset', 'loop-to-unique', 'unique-reset'):\n+        output[name] = config(name, .003)\n+    return output\n+\n+def loop_losses(model, tokens, loss):\n+    \"\"\"Pass the FULL default validation tokens and a batched token-NLL helper.\"\"\"\n+    before = model.eval_passes\n+    model.eval()\n+    try:\n+        values = {}\n+        for passes in sorted({1, model.passes, model.passes+1, 2*model.passes}):\n+            model.eval_passes = passes\n+            values[passes] = loss(model, tokens)\n+        return values\n+    finally:\n+        model.eval_passes = before",
  "q3": "--- /dev/null\n+++ b/experiments/a5_capacity/quiz_recipes.py\n@@ -0,0 +1,26 @@\n+\"\"\"Quiz recipes: small changes to the released A5 implementation.\"\"\"\n+from dataclasses import replace\n+\n+\n+def q3_configs():\n+    \"\"\"Fixed wide backbone on natural text: readout interventions and rank ladder.\"\"\"\n+    from .sweeps import config\n+    output = {}\n+    for rank in (64, 1280):\n+        for method in ('softmax', 'sigsoftmax', 'mos', 'cplm'):\n+            builder = 'CPLM' if method == 'cplm' else 'HeadLM'\n+            kwargs = dict(rank=None if rank == 1280 else rank)\n+            if method != 'cplm':\n+                kwargs['method'] = method\n+            output[f'wide-{method}-{rank}'] = config('dense', .003, depth=1, width=1280,\n+                model_builder=f'experiments.a5_capacity.p2_readout:{builder}',\n+                model_builder_kwargs=kwargs)\n+    for rank in (128, 256, 512):\n+        output[f'wide-softmax-{rank}'] = config('dense', .003, depth=1, width=1280,\n+            model_builder='experiments.a5_capacity.p2_readout:HeadLM',\n+            model_builder_kwargs=dict(method='softmax', rank=rank))\n+    return output\n+\n+def closest_rank(softmax_losses, mos64_loss):\n+    \"\"\"Compare final validation losses; ties choose the smaller rank.\"\"\"\n+    return min(softmax_losses, key=lambda rank: (abs(softmax_losses[rank]-mos64_loss), rank))",
  "q4": "--- /dev/null\n+++ b/experiments/a5_capacity/quiz_recipes.py\n@@ -0,0 +1,13 @@\n+\"\"\"Quiz recipes: small changes to the released A5 implementation.\"\"\"\n+from dataclasses import replace\n+\n+\n+def q4_configs():\n+    \"\"\"Independent recipes: reset A--D between parts; (b) changes one intervention.\"\"\"\n+    from .sweeps import config\n+    output = {f'a-{letter}': config(name, .003) for letter, name in\n+              zip('ABCD', ('moe-random', 'moe-frozen', 'moe-learned', 'dense'))}\n+    for letter, name in zip('ABCD', ('moe-cloned', 'moe-balanced', 'moe-quantile', 'moe-unit')):\n+        for lr in (.001, .002, .003, .0045, .006, .009, .0135):\n+            output[f'b-{letter}-{lr:g}'] = config(name, lr)\n+    return output",
  "q5": "--- /dev/null\n+++ b/experiments/a5_capacity/quiz_recipes.py\n@@ -0,0 +1,12 @@\n+\"\"\"Quiz recipes: small changes to the released A5 implementation.\"\"\"\n+from dataclasses import replace\n+\n+\n+def q5_configs():\n+    from .sweeps import config\n+    return {'red': config('moe-learned', .006)}\n+\n+def router_layers(model, tokens):\n+    \"\"\"A5's diagnostic example: first8 validation sequences, first128 positions.\"\"\"\n+    from .diagnostics import measure_model\n+    return measure_model(model, tokens[:8, :128])['router_layers']",
  "q6": "--- a/experiments/a5_capacity/p3_moe.py\n+++ b/experiments/a5_capacity/p3_moe.py\n@@ -18,10 +18,10 @@\n class Experts(nn.Module):\n-    def __init__(self, config):\n+    def __init__(self, config, experts=4):\n         super().__init__()\n         d, i = config.hidden_size, config.intermediate_size\n-        self.gate = nn.Parameter(torch.empty(4, d, i))\n-        self.up = nn.Parameter(torch.empty(4, d, i))\n-        self.down = nn.Parameter(torch.empty(4, i, d))\n+        self.gate = nn.Parameter(torch.empty(experts, d, i))\n+        self.up = nn.Parameter(torch.empty(experts, d, i))\n+        self.down = nn.Parameter(torch.empty(experts, i, d))\n         self.reset_parameters()\n@@ -46,13 +46,14 @@\n class RouterMLP(nn.Module):\n     def __init__(self, config, *, routing='learned', norm=False, noise=0., clone=False,\n-                 unit=False, balance=0., quantile=False, top_k=1):\n+                 unit=False, balance=0., quantile=False, top_k=1, experts=4):\n         super().__init__()\n-        self.experts = Experts(config)\n-        self.router = nn.Linear(config.hidden_size, 4, bias=False)\n+        self.count = experts\n+        self.experts = Experts(config, experts)\n+        self.router = nn.Linear(config.hidden_size, experts, bias=False)\n         self.norm = LlamaRMSNorm(config.hidden_size, 1e-5) if norm else nn.Identity()\n         self.routing, self.noise, self.clone = routing, noise, clone\n         self.unit, self.balance, self.quantile, self.top_k = unit, balance, quantile, top_k\n         if routing in ('random', 'frozen'):self.router.requires_grad_(False)\n-        self.register_buffer('bias', torch.zeros(4))\n+        self.register_buffer('bias', torch.zeros(experts))\n         self.pending = []\n         self.aux_loss = None\n@@ -65,9 +66,9 @@\n         p = logits.softmax(-1)\n         k = self.top_k\n-        selected = torch.randint(4, (len(x), k), device=x.device) if self.routing == 'random' else (logits+self.bias).\n     topk(k, -1).indices\n-        weights = torch.ones_like(selected, dtype=x.dtype) if self.unit or self.routing == 'random' else (4/k)*p.gather\n     (-1, selected).to(x.dtype)\n-        counts = torch.bincount(selected.flatten(), minlength=4)\n+        selected = torch.randint(self.count, (len(x), k), device=x.device) if self.routing == 'random' else (logits+\n     self.bias).topk(k, -1).indices\n+        weights = torch.ones_like(selected, dtype=x.dtype) if self.unit or self.routing == 'random' else (self.count/k)\n     *p.gather(-1, selected).to(x.dtype)\n+        counts = torch.bincount(selected.flatten(), minlength=self.count)\n         shares = counts.float()/selected.numel()\n-        self.aux_loss = self.balance*4*(shares.detach()*p.mean(0)).sum()\n+        self.aux_loss = self.balance*self.count*(shares.detach()*p.mean(0)).sum()\n         if self.training and torch.is_grad_enabled() and self.quantile:\n             alpha = (logits.detach()+self.bias).topk(k+1, -1).values[:, -1:]\n@@ -78,10 +79,10 @@\n         counts_cpu = counts.tolist()  # One routing synchronization per layer.\n         capacity = max(counts_cpu)\n-        if capacity <= 1.5*selected.numel()/4:\n+        if capacity <= 1.5*selected.numel()/self.count:\n             expert = selected.flatten()[order]\n             offset = torch.repeat_interleave(counts.cumsum(0)-counts, counts)\n             slot = expert*capacity + torch.arange(len(tokens), device=x.device)-offset\n-            packed = x.new_zeros((4*capacity, x.shape[-1])).index_copy(0, slot, x[tokens])\n-            values = self.experts.compute(packed.view(4, capacity, -1)).flatten(0, 1)[slot]\n+            packed = x.new_zeros((self.count*capacity, x.shape[-1])).index_copy(0, slot, x[tokens])\n+            values = self.experts.compute(packed.view(self.count, capacity, -1)).flatten(0, 1)[slot]\n         else:\n             chunks = x[tokens].split(counts_cpu)\n@@ -98,5 +99,5 @@\n             # Quantile threshold over all accumulation microbatches, for NEXT step.\n             residual = torch.cat(self.pending)\n-            target = max(1, len(residual)*self.top_k//4)\n+            target = max(1, len(residual)*self.top_k//self.count)\n             beta = residual.kthvalue(len(residual)-target+1, dim=0).values\n             self.bias.copy_(-beta+beta.mean())\n--- a/experiments/a5_capacity/p4_looping.py\n+++ b/experiments/a5_capacity/p4_looping.py\n@@ -132,2 +132,18 @@\n     from .sweeps import launch_one\n     launch_one('loop-r6', .003)  # Edit the variant and LR.\n+\n+\n+class LoopMoELM(LoopLM):\n+    \"\"\"Plain shared core with E learned experts; dense prelude and coda.\"\"\"\n+    def __init__(self, config, *, experts=6, **kwargs):\n+        from .p3_moe import RouterMLP\n+        super().__init__(config, **kwargs)\n+        for block in self.model.layers[1:-1]:\n+            if not isinstance(block.mlp, RouterMLP):\n+                block.mlp = RouterMLP(config, experts=experts)\n+\n+    def post_initialize(self):\n+        from .p3_moe import RouterMLP\n+        for module in self.modules():\n+            if isinstance(module, RouterMLP):\n+                module.experts.reset_parameters()\n--- /dev/null\n+++ b/experiments/a5_capacity/quiz_recipes.py\n@@ -0,0 +1,14 @@\n+\"\"\"Quiz recipes: small changes to the released A5 implementation.\"\"\"\n+from dataclasses import replace\n+\n+\n+def q6_configs(lrs=(.001, .002, .003, .0045, .006, .009)):\n+    from .sweeps import config\n+    output = {}\n+    for letter, passes in zip('ABCD', (6, 3, 2, 1)):\n+        for lr in lrs:\n+            extra = {} if passes == 1 else dict(\n+                model_builder='experiments.a5_capacity.p4_looping:LoopMoELM',\n+                model_builder_kwargs=dict(passes=passes, experts=passes))\n+            output[f'{letter}-{lr:g}'] = config('dense', lr, **extra)\n+    return output"
};

  const form = document.getElementById("quiz-form");
  const container = document.getElementById("quiz-questions");
  const validationError = document.getElementById("quiz-validation-error");
  const results = document.getElementById("quiz-results");
  const scoreElement = document.getElementById("quiz-score");
  const scoreSummary = document.getElementById("quiz-score-summary");
  const resetButton = document.getElementById("reset-quiz");
  const storageKey = "cs312-capacity-quiz-draft-v1";
  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  function groupRows(rows) {
    return rows.reduce((groups, row) => {
      const signature = JSON.stringify(row.options);
      const previous = groups.at(-1);
      if (previous && !row.before && previous.signature === signature) previous.rows.push(row);
      else groups.push({ signature, rows: [row] });
      return groups;
    }, []);
  }

  function renderRowGroup(group) {
    const introduction = group.rows[0].before || "";
    if (group.rows[0].kind === "ranking") {
      const row = group.rows[0];
      return `${introduction}<fieldset class="quiz-part" id="row-${row.id}"><legend class="quiz-part-title">${row.label}</legend><label for="ranking-${row.id}">Use A, B, C, and D once each, separated by &lt;, &gt;, or =. Use one direction throughout, with = for ties.</label><input class="quiz-ranking-input" id="ranking-${row.id}" type="text" name="${row.id}" placeholder="e.g. A &lt; B = C &lt; D" autocomplete="off" spellcheck="false" aria-describedby="ranking-help-${row.id}" required /><p class="quiz-scoring-note" id="ranking-help-${row.id}">The complete ranking earns 8 points, including the tie. Equivalent reversed chains are accepted.</p></fieldset>`;
    }
    if (group.rows[0].matrix) {
      return `${introduction}<div class="quiz-part quiz-table-wrap"><table class="quiz-answer-table quiz-capacity-matrix"><thead><tr><th scope="col">Method</th><th scope="col">Rank 64</th><th scope="col">Rank 1280</th></tr></thead><tbody>${group.rows.filter((row, i) => i % 2 === 0).map((row, i) => `<tr><th scope="row">${row.method}</th>${group.rows.slice(i * 2, i * 2 + 2).map(cell => `<td><fieldset class="quiz-comparison-cell" id="row-${cell.id}"><legend class="quiz-visually-hidden">${cell.label}: method loss versus same-rank Softmax loss</legend>${cell.options.map((option, index) => `<label><input type="radio" name="${cell.id}" value="${index}" required /><span aria-hidden="true">${option}</span><span class="quiz-visually-hidden">${cell.label}: ${option}</span></label>`).join("")}</fieldset></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    if (group.rows.length === 1) {
      const row = group.rows[0];
      const layoutClass = row.layout === "stacked" ? " quiz-options-stacked" : "";
      return `${introduction}<fieldset class="quiz-part" id="row-${row.id}"><legend class="quiz-part-title">${row.label}</legend><div class="quiz-options quiz-options-${row.options.length}${layoutClass}">${row.options.map((option, index) => `<label class="quiz-option"><input type="radio" name="${row.id}" value="${index}" required /><span>${option}</span></label>`).join("")}</div></fieldset>`;
    }
    return `${introduction}<div class="quiz-part quiz-table-wrap"><table class="quiz-answer-table"><thead><tr><th scope="col"><span class="quiz-visually-hidden">Question row</span></th>${group.rows[0].options.map((option) => `<th scope="col">${option}</th>`).join("")}</tr></thead><tbody>${group.rows.map((row) => `<tr id="row-${row.id}"><th scope="row">${row.label}</th>${row.options.map((option, index) => `<td><label class="quiz-table-choice"><input type="radio" name="${row.id}" value="${index}" required /><span class="quiz-visually-hidden">${row.label}: ${option}</span></label></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function renderDiff(question) {
    const patch = appendix[question.id] || "";
    const lines = patch.split("\n").map((line) => {
      const type = /^(---|\+\+\+)/.test(line) ? "file" : line.startsWith("+") ? "add" : line.startsWith("-") ? "remove" : line.startsWith("@@") ? "hunk" : "context";
      return `<span class="quiz-diff-line quiz-diff-${type}">${escapeHtml(line) || " "}</span>`;
    }).join("");
    const page = { q1: 11, q2: 11, q3: 12, q4: 12, q5: 13, q6: 13 }[question.id];
    return `<details class="quiz-diff"><summary>The diff (Appendix A.${question.id.slice(1)})</summary><p class="quiz-intervention-notes"><a href="assets/quizzes/capacity_prediction_quiz.pdf#page=${page}" target="_blank" rel="noopener">View the original appendix in PDF form</a></p><pre><code>${lines}</code></pre></details>`;
  }

  function renderRationales(question) {
    const parts = question.rationaleParts || [""];
    return `<div class="quiz-rationale-grid">${[["citation", "Assignment problem cited"], ["observations", "Observations from the experiment"], ["rationale", "Your rationale"]].map(([key, title]) => `<div class="quiz-rationale"><span>${title}</span>${parts.map((part, index) => `<label class="quiz-rationale-part${part ? "" : " quiz-visually-hidden"}" for="${question.id}-${key}-${index}">${part || title}</label><textarea id="${question.id}-${key}-${index}" name="${question.id}-${key}-${index}" aria-label="${title}${part ? " " + part : ""}"></textarea>`).join("")}</div>`).join("")}</div>`;
  }

  container.innerHTML = questions.map((question, index) => `<section class="quiz-question" id="${question.id}"><div class="quiz-question-heading"><h2>Q${index + 1}. ${question.title}</h2><span class="quiz-points">${question.points} points</span></div><p class="quiz-difficulty">Difficulty: ${question.difficulty}</p><div class="quiz-prompt">${question.prompt}</div>${groupRows(question.rows).map(renderRowGroup).join("")}${renderDiff(question)}${renderRationales(question)}<div class="quiz-feedback" hidden></div></section>`).join("");

  function saveDraft() {
    const draft = {};
    new FormData(form).forEach((value, key) => { draft[key] = value; });
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); } catch (_error) { /* The quiz also works without browser storage. */ }
  }

  function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!draft) return;
      Object.entries(draft).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (!field) return;
        if (field instanceof RadioNodeList) field.value = value;
        else if (field.type === "checkbox") field.checked = value === true || value === "on";
        else field.value = value;
      });
    } catch (_error) { /* Ignore unavailable storage or an invalid draft. */ }
  }

  function clearDraft() {
    try { localStorage.removeItem(storageKey); } catch (_error) { /* Storage is optional. */ }
  }

  function parseRanking(value) {
    const normalized = value.toUpperCase().replace(/\s+/g, "").replace(/＜/g, "<").replace(/＞/g, ">");
    if (!/^[ABCD](?:[<>=][ABCD]){3}$/.test(normalized)) return null;
    const names = normalized.match(/[ABCD]/g);
    if (new Set(names).size !== 4) return null;
    const operators = normalized.match(/[<>=]/g);
    if (operators.includes("<") && operators.includes(">")) return null;
    const direction = operators.includes(">") ? -1 : 1;
    let position = 0;
    const ranks = { [names[0]]: position };
    operators.forEach((operator, index) => {
      if (operator !== "=") position += direction;
      ranks[names[index + 1]] = position;
    });
    return ranks;
  }

  function validateRows() {
    const rows = questions.flatMap((question) => question.rows);
    const missing = rows.filter((row) => row.kind === "ranking"
      ? !parseRanking(form.elements.namedItem(row.id).value)
      : form.querySelectorAll(`input[name="${row.id}"]:checked`).length !== 1);
    let message = "";
    let firstId;
    if (missing.length) {
      firstId = missing[0].id;
      message = missing[0].kind === "ranking"
        ? "In Q4(a), rank A, B, C, and D once each using < or > throughout, with = for ties."
        : `Select exactly one answer in every row and complete the ranking. ${missing.length} ${missing.length === 1 ? "row is" : "rows are"} incomplete.`;
    } else {
      const groups = new Map();
      rows.filter((row) => row.uniqueGroup).forEach((row) => {
        if (!groups.has(row.uniqueGroup)) groups.set(row.uniqueGroup, []);
        groups.get(row.uniqueGroup).push(row);
      });
      for (const [name, group] of groups) {
        const values = group.map((row) => form.elements.namedItem(row.id).value);
        if (new Set(values).size !== values.length) {
          firstId = group[0].id;
          message = `Use each letter only once in ${name.replace(/^q(\d+)([a-z])$/, "Q$1($2)")}. Choose different letters for its matching rows.`;
          break;
        }
      }
    }
    validationError.textContent = message;
    validationError.hidden = !message;
    if (!message) return true;
    const first = document.getElementById(`row-${firstId}`);
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    first?.querySelector("input")?.focus({ preventScroll: true });
    return false;
  }

  const formatPoints = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);

  function gradeQuestion(question) {
    let points = 0;
    const details = [];
    question.rows.forEach((row) => {
      if (row.kind === "ranking") {
        const ranks = parseRanking(form.elements.namedItem(row.id).value);
        const names = ["A", "B", "C", "D"];
        const correct = names.every((a, i) => names.slice(i + 1).every(b => Math.sign(ranks[a] - ranks[b]) === Math.sign(row.correctRanks[a] - row.correctRanks[b])));
        const earned = correct ? row.exact : 0;
        points += earned;
        details.push(`${row.label}: ${earned}/${row.exact} — your answer: ${escapeHtml(form.elements.namedItem(row.id).value)}; answer: C = B &lt; D &lt; A`);
      } else {
        const selected = Number(form.elements.namedItem(row.id).value);
        const earned = row.credits ? row.credits[selected] : selected === row.correct ? row.exact : 0;
        points += earned;
        details.push(`${row.label}: ${formatPoints(earned)}/${formatPoints(row.exact)} — your answer: ${row.options[selected]}; answer: ${row.options[row.correct]}`);
      }
    });
    return { points, details, status: points === question.points ? "correct" : points > 0 ? "partial" : "incorrect" };
  }

  function renderFeedback(question, grade) {
    const section = document.getElementById(question.id);
    const feedback = section.querySelector(".quiz-feedback");
    feedback.className = `quiz-feedback ${grade.status}`;
    feedback.innerHTML = `<h3>${formatPoints(grade.points)} / ${question.points} points</h3><ul>${grade.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>${question.explanation}`;
    feedback.hidden = false;
    section.classList.add("is-graded");
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([feedback]);
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
    scoreElement.textContent = `${formatPoints(total)} / ${totalPoints} (${Math.round((total / totalPoints) * 100)}%)`;
    scoreSummary.textContent = "Review the explanations below and compare them with your assignment evidence and rationale.";
    form.querySelectorAll("input, textarea, button[type='submit']").forEach((control) => { control.disabled = true; });
    clearDraft();
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
    clearDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  restoreDraft();
  if (!window.confirm("The quizzes are best taken after completing the assignment. You are not allowed any external information on these quizzes (model runs, cheat sheets, etc.). Are you sure you want to take the quiz?")) window.location.href = "index.html";
})();
