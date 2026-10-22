(() => {
  "use strict";

  const tex = String.raw;
  const figure = (name, alt) => `<img class="quiz-prompt-image" src="assets/quizzes/optimization2_${name}.png" alt="${alt}" />`;
  const basinOptions = ["1. Avg &lt; Ens &lt; Best", "2. Avg = Ens &lt; Best", "3. Ens &lt; Avg &lt; Best", "4. Ens &lt; Best &lt; Avg", "5. Ens &lt; Avg = Best"];
  const questions = [
    {
      id: "q1", title: "Basins", difficulty: "Easy", points: 20,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall the forked-run sweep of Problem 1: the default recipe trains a LM at a constant LR of .003 after the warmup. A shared prefix trains for $x$ updates from model seed 42, then two branches continue for $y$ more updates with different data orders (<code>batch_order_seed</code> 1 and 2). For each cell we compare three validation losses: <em>Best</em>, the better of the two final losses; <em>Ens</em>, the 0.5/0.5 prediction ensemble of the two endpoints; and <em>Avg</em>, the 0.5/0.5 weight average.</p>`,
      rows: [
        {
          id: "q1a1", label: tex`(a) (i) $x = 100$, $y = 50$`, options: basinOptions, correct: 1, exact: 4,
          before: tex`<h3>(a) Average, ensemble, or neither, at a higher LR (12 points, 4 per cell).</h3><p><strong>This question changes.</strong> The whole sweep (prefix and both branches) is repeated at a <strong>constant LR of .01</strong> instead of .003, with the same warmup, model seed and data orders.</p><p>At LR .003 (Problem 1’s grid) the three cells below came out as shown. For each cell, which ordering, lowest (best) first, do you predict at LR .01? Two losses count as equal (=) when within .01.</p><div class="quiz-context-table-wrap"><table class="quiz-context-table"><thead><tr><th scope="col">Cell</th><th scope="col">$x$</th><th scope="col">$y$</th><th scope="col">At LR .003</th></tr></thead><tbody><tr><th scope="row">(i)</th><td>100</td><td>50</td><td>Avg = Ens &lt; Best</td></tr><tr><th scope="row">(ii)</th><td>100</td><td>250</td><td>Ens &lt; Avg &lt; Best</td></tr><tr><th scope="row">(iii)</th><td>250</td><td>250</td><td>Ens &lt; Avg &lt; Best</td></tr></tbody></table></div>`,
        },
        { id: "q1a2", label: tex`(a) (ii) $x = 100$, $y = 250$`, options: basinOptions, correct: 3, exact: 4 },
        { id: "q1a3", label: tex`(a) (iii) $x = 250$, $y = 250$`, options: basinOptions, correct: 2, exact: 4 },
        {
          id: "q1b", label: tex`(b) Sketch of $D(x)$`, options: ["1. a cliff", "2. falls steadily", "3. large until ~1,000, then drops", "4. below zero from 250 on"], correct: 1, exact: 8,
          before: tex`<h3>(b) How much shared training is enough? (8 points).</h3><p><strong>This question changes.</strong> The full default recipe (peak LR .003, linear decay to zero, 9,375 updates) is trained with <code>batch_order_seed</code> 1 from model seed 42. Second runs fork from its <strong>checkpoint</strong> (weights and optimizer state) <strong>at update $x \in \{0, 100, 250, 1{,}000, 4{,}000\}$</strong> ($x = 0$: a fresh run from the same init) and train the remaining $y = 9{,}375 - x$ updates with <code>batch_order_seed</code> 2. All runs end at a validation loss of about 2.93.</p><p>Let $D(x) = L(\mathrm{Avg}) - \min(L_1, L_2)$ for the two final models. Which sketch of $D$ against the fork point $x$ (log axis) matches? The $D$ axis is log scale, linear within $\pm .01$; the dotted line marks $D = .01$.</p>` + figure("q1b", "Four sketches of final D versus fork point: a cliff; a steady fall; a late drop near 1,000; or a drop below zero from 250 onward."),
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) (i) 2, (ii) 4, (iii) 3; (b) 2 (falls steadily, still above .01 at $x = 1{,}000$).</p><p><strong>A higher LR shrinks the connected region; inside it, nothing changes.</strong> At .01 the branches take $3.3\times$ larger steps, so two data orders separate faster. The average is .04–.06 worse than the better endpoint in cell (ii), which flips from option 3 to option 4. With 50-update branches the average matches the ensemble, cell (i), and after 250 updates the ensemble pulls ahead while the average still beats both endpoints, cell (iii).</p><p><strong>A full run needs far more shared training than a 500-update branch.</strong> $D$ falls steadily with $x$: about +2.56 at 0, +.82 at 100, +.36 at 250, +.057 at 1,000, and −.004 at 4,000 (seed 42). The second run trains 5,375 to 9,375 updates on its own, so the boundary moves to much larger $x$. Even at 4,000 the average does not beat the endpoints by .01. The ensemble helps at every $x$.</p>`,
    },
    {
      id: "q2", title: "Fixing a mis-set peak LR mid-run", difficulty: "Hard", points: 20,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall the schedule experiments of Problem 2. With the <code>wsd0.2</code> schedule at peak LR .003, the final validation loss is 2.935. In the dip-and-rewarm experiments of Problem 2(c), we lowered this run’s LR for part of training and brought it back to .003 to see the impact of LR changes.</p>`,
      rows: [
        {
          id: "q2a", label: "(a) At 5,000, at the end", options: ["1. behind, behind", "2. ahead, ahead or level", "3. ahead, behind", "4. level, behind", "5. behind, level or ahead"], correct: 2, exact: 10,
          before: tex`<h3>(a) A too-high start, before and after the cooldown (10 points).</h3><p><strong>This question changes.</strong> The <code>wsd0.2</code> run is launched with the <strong>wrong peak LR, .012</strong> ($4\times$ too high). Partway through, the mistake is caught and the LR is set to .003 for the rest of training, with the same cooldown.</p>` + figure("q2a_schedule", "Learning rate starts at .012, is fixed to .003 at update 3,750, and decays to zero from 7,500 to 9,375. The control starts at .003.") + tex`<p>The LR .012 run is fixed at update 3,750 (see figure). Compare its validation loss with the baseline run (<code>wsd0.2</code> with LR .003) at update 5,000 (before the cooldown) and at the end of training. The fixed run is <em>ahead</em> if its loss is lower by more than .005, <em>level</em> if the two are within .005, and <em>behind</em> otherwise. Which sketch matches the fixed run at update 5,000 and at the end?</p>` + figure("q2a_choices", "Five sketches of fixed-run loss minus correct-run loss: behind then behind; ahead then ahead or level; ahead then behind; level then behind; or behind then level or ahead."),
        },
        {
          id: "q2b", label: "(b) Ranking", layout: "stacked", options: ["1. 20% &lt; 40% &lt; 60% &lt; left alone", "2. 20% &lt; 40% &lt; left alone &lt; 60%", "3. 20% &lt; left alone &lt; 40% &lt; 60%", "4. 20% = 40% = 60% (within .005) &lt; left alone"], correct: 1, exact: 10,
          before: tex`<h3>(b) A too-low start, fixed early or late (10 points).</h3><p><strong>This question changes.</strong> The <code>wsd0.2</code> run is launched at .00075 ($4\times$ too low) and fixed the same way, at one of three points, or left alone.</p>` + figure("q2b_schedule", "The .00075 learning rate is either left alone or fixed to .003 at update 1,875, 3,750, or 5,625, before the shared cooldown.") + `<p>Consider the four 0.00075 LR runs: three are fixed at updates 1,875, 3,750 or 5,625 (20%, 40%, 60% of training, see figure) and one is left alone. Rank the choices of when (and whether) to fix the LR based on validation loss. Each option has the lowest loss choice first.</p>`,
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) 3 (ahead at 5,000, behind at the end). (b) 2 (20% &lt; 40% &lt; left alone &lt; 60%).</p><p><strong>The too-high run is ahead until the cooldown, then behind.</strong> At update 5,000 the fixed run is .022 / .023 below the correct run; at the end it is .034 / .036 above it (seeds 42 / 43). The $4\times$ LR doubled the RMS of every weight matrix. A fixed AdamW step at .003 is a smaller relative step on the inflated matrices: the first ~2,000 updates after the fix act like a partial cooldown. Until the shared cooldown, the run makes less progress along the river, and the cooldown exposes the deficit.</p><p><strong>Fixing a too-low LR late is worse than leaving it alone.</strong> Final losses for fixes at 20%, 40%, left alone, and 60% are 2.9386, 2.9529, 2.9635, and 2.9761 at seed 42. The raised run pays a rewarm transient that has too little time to decay before the cooldown; the run left alone keeps its low-LR valley position.</p>`,
    },
    {
      id: "q3", title: "Weight averaging with an EMA", difficulty: "Medium", points: 20,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall the evaluation-only EMA of the weights in Problem 2(b) (decay .999, a window of about 1,000 updates). It helps a lot at constant LR and slightly hurts at the end of schedules that decay to zero. At a constant LR of .003 after the warmup, the final validation loss is 3.099 for the raw weights and 2.973 for the EMA.</p>`,
      rows: [
        {
          id: "q3a", label: "(a) Ranking", options: [tex`1. $L_{.0015} < L_{.003} < L_{.006}$`, tex`2. $L_{.003}$ is the lowest of the three`, tex`3. $L_{.006} < L_{.003} < L_{.0015}$`, "4. All three within .005"], correct: 0, exact: 10,
          before: tex`<h3>(a) The best peak LR for constant LR plus EMA (10 points).</h3><p><strong>This question changes.</strong> The constant-LR run at peak LR <strong>.0015 and .006</strong>, with the same EMA.</p><p>Let $L_{.0015}$, $L_{.003}$ and $L_{.006}$ be the final validation losses of the EMA weights at the three peak LRs. Which ranking do you predict?</p>`,
        },
        {
          id: "q3b", label: "(b) EMA worse for good", options: ["1. at the start of the cooldown", "2. around the middle of the cooldown", tex`3. late in the cooldown (LR below $.15\times$ peak)`, "4. never: the EMA stays better"], correct: 2, exact: 10, partial: [1, 3],
          before: tex`<h3>(b) When the EMA stops helping (10 points).</h3><p><strong>This question changes.</strong> The <code>wsd0.5</code> schedule at peak LR .003 (constant, then a linear decay to zero over the last 50% of training, from update 4,688), with the same EMA.</p><p>In the <code>wsd0.5</code> run, let $\Delta(t)$ be the EMA’s validation loss minus the raw weights’ at update $t$. When does $\Delta$ become positive (EMA worse) for good?</p>` + figure("q3b", "Four EMA-minus-raw-loss sketches crossing zero at the start, around the middle, late in the cooldown, or never."),
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) 1 ($L_{.0015} < L_{.003} < L_{.006}$). (b) 3 (late in the cooldown).</p><p><strong>An EMA wants a lower peak LR than a decaying schedule.</strong> Final EMA losses at .0015, .003 and .006 are 2.961 / 2.960, 2.973 / 2.973, and 3.029 / 3.028 (seeds 42 / 43). The EMA’s gain grows with the LR, but not enough to reverse the raw ordering. What is left is the part that averaging cannot fix, and it grows with the LR.</p><p><strong>The EMA turns worse only late in the cooldown.</strong> $\Delta$ becomes positive for good at update 9,024 in both seeds, where the LR is $.075\times$ the peak. At update 8,672 (LR $.15\times$) it is still −.008 / −.009. The EMA beats the raw weights while averaging out the LR noise is worth more than its lag along the river, which holds until the LR is very small.</p>`,
    },
    {
      id: "q4", title: "Dips and rewarms", difficulty: "Medium", points: 20,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall the dip-and-rewarm experiments of Problem 2(c). A dip multiplies the LR of the <code>wsd0.2</code> control (peak .003) by a factor that falls linearly from 1 to a floor and then returns linearly to 1. The starter dip runs from 40% to 50% of training with a floor of $0.1\times$ at 45%, and gives a large temporary gain at its bottom.</p>`,
      rows: [
        {
          id: "q4a", label: "(a) Sketch", options: ["1. smaller trough, clearly smaller overshoot", "2. smaller trough, about the same overshoot", "3. same trough, same overshoot", "4. smaller trough, clearly larger, longer overshoot"], correct: 1, exact: 10,
          before: tex`<h3>(a) Same area, different shape (10 points).</h3><p><strong>This question changes.</strong> A <strong>shallow, long dip</strong> from 35% to 55% of training with a floor of $0.55\times$ at 45%. It removes the same LR area as the starter dip (422 updates’ worth of peak LR).</p>` + figure("q4a_schedule", "Two learning rate dips: the starter has floor .1 from 40% to 50%; the shallow, long dip has floor .55 from 35% to 55%. Both remove the same learning rate area.") + `<p>Which sketch matches the two dips’ regret curves? (“About the same overshoot”: within a factor of 1.5.)</p>` + figure("q4a_choices", "Four regret sketches comparing the starter dip with the shallow, long dip: smaller trough and smaller overshoot; smaller trough and similar overshoot; same trough and same overshoot; smaller trough and larger, longer overshoot."),
        },
        {
          id: "q4b", label: tex`(b) $L_A - L_B$`, options: [tex`1. $(-\infty, -.005)$`, tex`2. $[-.005, .005)$`, tex`3. $[.005, \infty)$`], correct: 0, exact: 10, partial: [1],
          before: tex`<h3>(b) Instant or gradual rewarm (10 points).</h3><p><strong>This question changes.</strong> Two runs on the control: run A <strong>cools linearly to zero</strong> between 30% and 40% of training and then <strong>jumps back</strong> to .003; run B cools the same way and then <strong>re-warms linearly</strong> from 0 to .003 between 40% and 60%.</p>` + figure("q4b_schedule", "Run A jumps to .003 at 40% after a cooldown to zero; run B ramps from zero to .003 between 40% and 60%. Both share the final cooldown.") + tex`<p>Let $L_A$ and $L_B$ be the final validation losses of runs A and B. Which interval contains $L_A - L_B$?</p>`,
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) 2 (smaller trough, about the same overshoot). (b) 1 (A better by more than .005).</p><p><strong>The overshoot follows the LR area, not the shape.</strong> The starter trough is −.117 / −.119 and the shallow, long trough is −.070 / −.071 (seeds 42 / 43). Mean overshoots are +.0103 / +.0092 versus +.0115 / +.0120, ratios 1.1 / 1.3. Both dips remove 422 updates, so both pay about the same overshoot. The trough measures how low the LR goes: the deep dip reaches further down the valley walls.</p><p><strong>An instant rewarm is better.</strong> $L_A - L_B = -.010 / -.011$. Both cooldowns remove the same triangle of LR area, and B’s ramp removes another ~938 updates’ worth. A gradual ramp gives up peak-LR progress that the run cannot recover before the cooldown.</p>`,
    },
    {
      id: "q5", title: "Full-batch gradient descent at the edge", difficulty: "Medium", points: 20,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall the full-batch experiments of Problem 3(a): gradient descent on the first $N$ training sequences for 1,500 updates, with $\lambda_{\max}$ measured on the training set every 25 updates. In the clean case ($N = 32$, $\eta = .01$, <code>d8</code>), $\eta\lambda_{\max}$ first exceeds 2 at update 375.</p>`,
      rows: [
        {
          id: "q5a", label: tex`(a) Median $\eta\lambda_{\max}$`, options: [tex`1. $(0, 2.2)$`, tex`2. $[2.2, 3)$`, tex`3. $[3, 6)$`, tex`4. $[6, \infty)$`, "5. The run diverges"], correct: 2, exact: 10, partial: [1, 3],
          before: tex`<h3>(a) How far above 2 at a large step size (10 points).</h3><p><strong>This question changes.</strong> $N = 256$ sequences and $\eta = 0.2$.</p><p>From update 100 on, while the training loss is still above 1 (before the sequences are memorized), which interval contains the median of $\eta\lambda_{\max}$?</p>`,
        },
        {
          id: "q5b", label: "(b) Ranking", options: [tex`1. $t_4 < t_8 < t_{16}$`, "2. All three within 20% of each other", tex`3. $t_{16} < t_8 < t_4$`, tex`4. $t_8$ is the earliest of the three`], correct: 2, exact: 10,
          before: tex`<h3>(b) Depth and progressive sharpening (10 points).</h3><p><strong>This question changes.</strong> The clean case at <strong>depth 4 and depth 16</strong> (width 512, 64-dimensional heads), next to the standard depth 8.</p><p>Let $t_L$ be the first update at which $\eta\lambda_{\max} > 2$ at depth $L$. Which ranking do you predict?</p>`,
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) 3 ($[3, 6)$). (b) 3 ($t_{16} < t_8 < t_4$).</p><p><strong>The edge is a band that rises with the step size.</strong> The median of $\eta\lambda_{\max}$ is 4.66 / 4.63 (seeds 42 / 43); the loss passes 1 near update 965 / 838 and the run never diverges. A run above the edge sheds sharpness instead of diverging. The value 2 is exact only for a quadratic.</p><p><strong>Deeper networks reach the edge sooner.</strong> First crossings at depth 4 / 8 / 16: updates 575 / 375 / 225 (seed 43: 500 / 350 / 225). Sharpening follows training progress, and deeper networks fit faster per update; they also start sharper ($\lambda_{\max}$ at initialization 17 / 22 / 32).</p>`,
    },
    {
      id: "q6", title: "Weight decay as a sharpness knob", difficulty: "Medium", points: 20,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall Problem 4(b): weight decay moves $\lambda_{\max}$ at nearly fixed loss through rescaling symmetries. The default mask decays the hidden and readout matrices (including the LM head) but not the embedding or the RMSNorm gains. With this mask and peak LR .003, weight decay 0, .1 and .3 give a final $\lambda_{\max}$ of about 2.5, 6 and 15.</p>`,
      rows: [
        {
          id: "q6a", label: tex`(a) $\lambda_{\max}$ ratio`, options: [tex`1. $(0, .8)$`, tex`2. $[.8, 1.2)$`, tex`3. $[1.2, \infty)$`], correct: 0, exact: 10, partial: [1],
          before: tex`<h3>(a) Decaying every tensor (10 points).</h3><p><strong>This question changes.</strong> Weight decay .1 is applied to <strong>every tensor</strong>, including the embedding and all RMSNorm gains.</p><p>Which interval contains the run’s final $\lambda_{\max}$ divided by the default run’s (same seed)?</p>`,
        },
        {
          id: "q6b", label: "(b) Ranking", options: ["1. All three within 20% of each other", tex`2. $\lambda_S > \lambda_{\mathrm{def}} > \lambda_T$`, tex`3. $\lambda_T > \lambda_{\mathrm{def}} > \lambda_S$`, tex`4. $\lambda_{\mathrm{def}}$ is the highest of the three`], correct: 1, exact: 10,
          before: tex`<h3>(b) Trading LR for weight decay (10 points).</h3><p><strong>This question changes.</strong> The default mask, with the peak LR $\eta$ and the weight decay $w$ changed together at a <strong>fixed product $\eta w = 3\times 10^{-4}$</strong>, the default value:</p><div class="quiz-context-table-wrap"><table class="quiz-context-table"><thead><tr><th scope="col">Run</th><th scope="col">Peak LR $\eta$</th><th scope="col">Weight decay $w$</th><th scope="col">$\eta w$</th></tr></thead><tbody><tr><th scope="row">S</th><td>.001</td><td>.3</td><td>$3\times 10^{-4}$</td></tr><tr><th scope="row">Default</th><td>.003</td><td>.1</td><td>$3\times 10^{-4}$</td></tr><tr><th scope="row">T</th><td>.01</td><td>.03</td><td>$3\times 10^{-4}$</td></tr></tbody></table></div><p>Let $\lambda_S$, $\lambda_{\mathrm{def}}$ and $\lambda_T$ be the final $\lambda_{\max}$ of runs S, Default and T. Which ranking do you predict?</p>`,
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) 1 ($(0, .8)$). (b) 2 ($\lambda_S > \lambda_{\mathrm{def}} > \lambda_T$).</p><p><strong>Decaying the gains removes the push that sharpens the head.</strong> The ratio is .72 / .68 / .68 at the same loss (seeds 42 / 43 / 44). The default mask decays the LM head $W$ but not the final RMSNorm gain $g$, pushing the pair along the symmetry $W \to W/c$, $g \to cg$ and multiplying the head’s curvature by $c^2$. Decaying $g$ as well removes that push, so the head ends flatter.</p><p><strong>The product $\eta w$ does not set the sharpness.</strong> Final $\lambda_{\max}$ is 11.49 / 11.81 for S, 5.97 / 4.81 for Default, and 3.01 / 1.46 for T. More weight decay sharpens the head along the gain/head symmetry, and a lower LR tolerates more curvature. T reverses both. The product sets the timescale on which weight decay forgets, not where the run sits on the symmetry orbit.</p>`,
    },
    {
      id: "q7", title: "Training in the top subspace", difficulty: "Hard", points: 10,
      prompt: tex`<p><strong>From the assignment (reference only).</strong> Recall Problem 4(c). From the SGDM checkpoint at 100M tokens, removing the component of each update in the top-10 Hessian eigenspace costs nothing over 300 steps, while keeping only that component makes no progress.</p>`,
      rows: [
        {
          id: "q7a", label: "Loss change", options: [tex`1. $(-\infty, -.05)$`, tex`2. $[-.05, .05)$`, tex`3. $[.05, .3)$`, tex`4. $[.3, \infty)$`], correct: 3, exact: 10, partial: [2],
          before: tex`<h3>Adam fed only the top subspace (10 points).</h3><p><strong>This question changes.</strong> The keep-only experiment on the <strong>AdamW checkpoint at 100M tokens</strong>: the minibatch gradient is replaced by its component in the top-10 eigenspace of the Hessian <strong>before AdamW sees it</strong>, for 300 steps, with the eigenvectors recomputed every 25 steps. AdamW’s moment estimates are carried over from the checkpoint, not reset.</p><p>Which interval contains the validation loss after the 300 steps minus the validation loss at the checkpoint (positive if the loss went up)?</p>`,
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> 4 ($[.3, \infty)$).</p><p><strong>Adam turns a tiny projected gradient into large, undirected steps.</strong> The validation loss goes from 3.32 to 6.86 (seed 42) and from 3.33 to 5.49 (seed 43); the full update reaches 3.28. With SGDM, the top-subspace component carries no useful descent. AdamW divides by $\sqrt{\hat v}$; with $\beta_2 = .95$, the carried-over $\hat v$ is rebuilt from the projected gradient itself within a few dozen steps, so every coordinate soon takes a full-size step again. The sign pattern of those steps is no longer confined to the top subspace, so the update is large motion in no useful direction.</p>`,
    },
  ];

  // The appendix patches are transcribed directly from the student handout.
  const appendix = {
    q1: tex`Part (a):
--- a/experiments/a3_optimization/p1_mode_connectivity.py
+++ b/experiments/a3_optimization/p1_mode_connectivity.py
@@ -62,2 +62,11 @@ BRANCHES = {
+# Quiz 3, Question 1(a): the same sweep at a constant LR of .01 (a Problem 1(d) knob), measured on
+# the cells (100, 50), (100, 250) and (250, 250).
+LR01 = replace(BASE, learning_rate=0.01)
+PREFIX_LR01 = prefix_for(LR01)
+BRANCHES_LR01 = {x: [branch(x, seed, base=LR01) for seed in BRANCH_ORDER_SEEDS] for x in (100, 250)}
+LR01_RUNS = [PREFIX_LR01] + [run for runs in BRANCHES_LR01.values() for run in runs]
+LR01_PAIRS = [((training_run_name(a), x + y), (training_run_name(b), x + y))
+              for x, y in ((100, 50), (100, 250), (250, 250)) for a, b in [BRANCHES_LR01[x]]]
+
@@ -107,3 +116,3 @@ def main():
-        launch_training_jobs([PREFIX])
+        launch_training_jobs([PREFIX, PREFIX_LR01])
     elif args.stage == "branches":
@@ -112,3 +121,4 @@ def main():
         check_prefix_checkpoints()
-        launch_training_jobs([run for runs in BRANCHES.values() for run in runs])
+        check_prefix_checkpoints(PREFIX_LR01)
+        launch_training_jobs([run for runs in BRANCHES.values() for run in runs] + LR01_RUNS[1:])
     else:
@@ -116,3 +126,3 @@ def main():
-        rows = measure_pairs_on_modal(pairs())
+        rows = measure_pairs_on_modal(pairs() + LR01_PAIRS)
         RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)

Part (b):
--- a/experiments/a3_optimization/p1_mode_connectivity.py
+++ b/experiments/a3_optimization/p1_mode_connectivity.py
@@ -62,2 +62,11 @@ BRANCHES = {
+# Quiz 3, Question 1(b): the default recipe in data order 1, and a second run in data order 2
+# forked from it at update x (x = 0: a fresh run from the same initialization).
+FORKS = (0, 100, 250, 1000, 4000)
+FULL = TrainConfig(batch_order_seed=1, keep_checkpoint_steps=FORKS[1:], run_name_suffix="quiz3-q1b")
+SECOND = [replace(FULL, batch_order_seed=2, keep_checkpoint_steps=(),
+                  **(dict(fork_from_run=training_run_name(FULL), fork_from_step=x) if x else {}))
+          for x in FORKS]
+FINAL_PAIRS = [((training_run_name(FULL), None), (training_run_name(r), None)) for r in SECOND]
+
@@ -107,3 +116,3 @@ def main():
-        launch_training_jobs([PREFIX])
+        launch_training_jobs([PREFIX, FULL])
     elif args.stage == "branches":
@@ -112,3 +121,3 @@ def main():
         check_prefix_checkpoints()
-        launch_training_jobs([run for runs in BRANCHES.values() for run in runs])
+        launch_training_jobs([run for runs in BRANCHES.values() for run in runs] + SECOND)
     else:
@@ -116,3 +125,3 @@ def main():
-        rows = measure_pairs_on_modal(pairs())
+        rows = measure_pairs_on_modal(pairs() + FINAL_PAIRS)
         RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)`,
    q2: tex`--- a/experiments/a3_optimization/p2_river_valley.py
+++ b/experiments/a3_optimization/p2_river_valley.py
@@ -5,4 +5,6 @@
+import sys
+
 from modal_train import launch_training_jobs
-from train import TrainConfig
+from train import TrainConfig, training_run_name
@@ -40,2 +42,11 @@ RUNS = SCHEDULE_RUNS + REWARM_RUNS + HORIZON_FREE_RUNS
+# Quiz 3, Question 2: wsd0.2 launched at a wrong peak LR (4x too high or too low). The fix forks
+# the run at update u with the peak LR set to .003 (stage 'quiz3-q2', after these runs finish).
+WRONG = [TrainConfig(lr_schedule="wsd0.2", learning_rate=lr, keep_checkpoint_steps=u,
+                     run_name_suffix="quiz3-q2")
+         for lr, u in ((0.012, (3750,)), (0.00075, (1875, 3750, 5625)))]
+FIXED = [TrainConfig(lr_schedule="wsd0.2", fork_from_run=training_run_name(run), fork_from_step=u,
+                     run_name_suffix="quiz3-q2") for run in WRONG for u in run.keep_checkpoint_steps]
+RUNS += WRONG
+
@@ -49,3 +60,3 @@ RUNS = SCHEDULE_RUNS + REWARM_RUNS + HORIZON_FREE_RUNS
 def main():
-    launch_training_jobs(RUNS)
+    launch_training_jobs(FIXED if sys.argv[1:] == ["quiz3-q2"] else RUNS)`,
    q3: tex`--- a/experiments/a3_optimization/p2_river_valley.py
+++ b/experiments/a3_optimization/p2_river_valley.py
@@ -40,2 +40,7 @@ RUNS = SCHEDULE_RUNS + REWARM_RUNS + HORIZON_FREE_RUNS
+# Quiz 3, Question 3: constant LR at .0015 and .006, and wsd0.5 at .003, with the same EMAs.
+RUNS += [TrainConfig(lr_schedule=schedule, learning_rate=lr, ema_decays=EMA_DECAYS,
+                    run_name_suffix="quiz3-q3")
+         for schedule, lr in (("wsd0.0", 1.5e-3), ("wsd0.0", 6e-3), ("wsd0.5", 3e-3))]
+`,
    q4: tex`--- a/experiments/a3_optimization/p2_river_valley.py
+++ b/experiments/a3_optimization/p2_river_valley.py
@@ -40,2 +40,7 @@ RUNS = SCHEDULE_RUNS + REWARM_RUNS + HORIZON_FREE_RUNS
+# Quiz 3, Question 4: (a) a shallow, long dip with the part (c) dip's LR area; (b) a cooldown to 0
+# over 30-40% of training, then an instant (A) or a 40-60% linear (B) return to the peak LR.
+RUNS += [TrainConfig(lr_schedule="wsd0.2", lr_dip=dip, run_name_suffix="quiz3-q4")
+         for dip in ((0.35, 0.45, 0.55, 0.55), (0.3, 0.4, 0.4, 0.0), (0.3, 0.4, 0.6, 0.0))]
+`,
    q5: tex`--- a/experiments/a3_optimization/p3_edge_of_stability.py
+++ b/experiments/a3_optimization/p3_edge_of_stability.py
@@ -8,4 +8,7 @@ logging/sharpness/*. Read the results back with experiments.a3_optimization.shar
+from dataclasses import replace
+
 from metric_logging import AFTER_BACKWARD, MetricLogger
 from modal_train import launch_training_jobs
+from model_config import depth_model_config
 from sharpness_logging import SharpnessLogger
@@ -79,2 +82,8 @@ FULL_BATCH_RUNS = [
     full_batch(32, 1500, learning_rate=0.01), # (a) i: the clean case
+    # Quiz 3, Question 5: (a) N = 256 at eta = 0.2; (b) the clean case at depth 4 and 16.
+    full_batch(256, 1500, learning_rate=0.2, run_name_suffix="quiz3-q5a"),
+    *(full_batch(32, 1500, learning_rate=0.01, run_name_suffix="quiz3-q5b",
+                 model_config=replace(depth_model_config(8), name=f"d{depth}w512",
+                                      num_hidden_layers=depth)) # width 512 at every depth
+      for depth in (4, 16)),
 ]`,
    q6: tex`Part (a):
--- a/experiments/a3_optimization/p4_inside_the_hessian.py
+++ b/experiments/a3_optimization/p4_inside_the_hessian.py
@@ -56,2 +56,3 @@ RUNS = [
     # TrainConfig(<setting>=<value>, wandb_tags=(EXPERIMENT_KEY,)),
+    TrainConfig(run_name_suffix="quiz3-q6a"), # Quiz 3, Question 6(a)
 ]
--- a/optimizers.py
+++ b/optimizers.py
@@ -13,2 +13,3 @@ def is_norm_module(module):
 def should_apply_weight_decay(module, parameter_name):
+    return True # Quiz 3, Question 6(a): decay every tensor
     if isinstance(module, torch.nn.Embedding):

Part (b):
--- a/experiments/a3_optimization/p4_inside_the_hessian.py
+++ b/experiments/a3_optimization/p4_inside_the_hessian.py
@@ -56,2 +56,5 @@ RUNS = [
     # TrainConfig(<setting>=<value>, wandb_tags=(EXPERIMENT_KEY,)),
+    # Quiz 3, Question 6(b): peak LR and weight decay at the default product, 3e-4.
+    TrainConfig(learning_rate=1e-3, weight_decay=0.3, run_name_suffix="quiz3-q6b"),
+    TrainConfig(learning_rate=1e-2, weight_decay=0.03, run_name_suffix="quiz3-q6b"),
 ]`,
    q7: tex`--- a/experiments/a3_optimization/p4_inside_the_hessian.py
+++ b/experiments/a3_optimization/p4_inside_the_hessian.py
@@ -74,2 +74,4 @@ SUBSPACE_JOBS = [
 ]
+# Quiz 3, Question 7: the top arm on the AdamW checkpoint.
+SUBSPACE_JOBS += [{"name": "quiz3-q7a", "continue": {**START, "run": "adamw", "transform": "top"}}]`,
  };

  const form = document.getElementById("quiz-form");
  const container = document.getElementById("quiz-questions");
  const validationError = document.getElementById("quiz-validation-error");
  const results = document.getElementById("quiz-results");
  const scoreElement = document.getElementById("quiz-score");
  const scoreSummary = document.getElementById("quiz-score-summary");
  const resetButton = document.getElementById("reset-quiz");
  const storageKey = "cs312-optimization2-quiz-draft-v1";
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
    return `<details class="quiz-diff"><summary>The diff (Appendix A.${question.id.slice(1)})</summary><pre><code>${lines}</code></pre></details>`;
  }

  container.innerHTML = questions.map((question, index) => `<section class="quiz-question" id="${question.id}"><div class="quiz-question-heading"><h2>Q${index + 1}. ${question.title}</h2><span class="quiz-points">${question.points} points</span></div><p class="quiz-difficulty">Difficulty: ${question.difficulty}</p><div class="quiz-prompt">${question.prompt}</div>${groupRows(question.rows).map(renderRowGroup).join("")}${renderDiff(question)}<div class="quiz-rationale-grid"><label class="quiz-rationale"><span>Assignment problem cited</span><textarea name="${question.id}-citation"></textarea></label><label class="quiz-rationale"><span>Observations from the experiment</span><textarea name="${question.id}-observations"></textarea></label><label class="quiz-rationale"><span>Your rationale</span><textarea name="${question.id}-rationale"></textarea></label></div><div class="quiz-feedback" hidden></div></section>`).join("");

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
      const selected = Number(form.elements.namedItem(row.id).value);
      // Only the choices explicitly marked with half-credit in the answer sheet earn partial credit.
      const earned = selected === row.correct ? row.exact : row.partial?.includes(selected) ? row.exact / 2 : 0;
      points += earned;
      return `${row.label}: ${formatPoints(earned)}/${formatPoints(row.exact)} — your answer: ${row.options[selected]}; answer: ${row.options[row.correct]}`;
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
