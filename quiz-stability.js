(() => {
  "use strict";

  const tex = String.raw;
  const letters3 = ["A", "B", "C"];
  const letters4 = ["A", "B", "C", "D"];
  const figure = (name, alt) => `<a href="assets/quizzes/stability_${name}.png" target="_blank" rel="noopener" title="Open figure at full size"><img class="quiz-prompt-image" src="assets/quizzes/stability_${name}.png" alt="${alt}" /></a>`;
  const regretOptions = [
    tex`A: $\Delta < -.02$ (improves)`,
    tex`B: $-.02 \le \Delta < .02$ (little change)`,
    tex`C: $.02 \le \Delta < .05$`,
    tex`D: $.05 \le \Delta \le .15$`,
    tex`E: $\Delta > .15$ or all tried runs diverge`,
  ];
  const questions = [
    {
      id: "q1", title: "Norms across depth", difficulty: "Easy", points: 12, rationaleParts: ["(a)", "(b)"],
      prompt: tex`<p><strong>From A4 Problem 1.</strong> Match the three trained transformer variants to the activation plots in (a) and gradient plots in (b). Use A–C once in each part; the two parts use different letter assignments.</p><p>For each attention or MLP sublayer, $x$ is the incoming depth stream, $F$ its operation, and $N$ its RMSNorm. The three updates are:</p><p>No pre-norm: $x' = x + F(x)$,<br />Post-norm: $x' = N(x + F(x))$,<br />No residual: $x' = F(N(x))$.</p><p>Each variant changes both attention and MLP sublayers. At each complete block output $x_\ell$, measure $\operatorname{RMS}(x_\ell)$ and $\operatorname{RMS}(\partial L/\partial x_\ell)$ over batch, time, and features. $L$ is the mean loss over all next-token targets.</p>`,
      rows: [
        { id: "q1a1", label: "No pre-norm", options: letters3, correct: 0, exact: 2, uniqueGroup: "q1a", before: `<h3>(a) Activation RMS (6 points; 2 per variant).</h3>` + figure("q1a", "Activation RMS across eight blocks: A grows gradually, B stays near one, and C grows much faster, reaching hundreds.") },
        { id: "q1a2", label: "Post-norm", options: letters3, correct: 1, exact: 2, uniqueGroup: "q1a" },
        { id: "q1a3", label: "No residual", options: letters3, correct: 2, exact: 2, uniqueGroup: "q1a" },
        { id: "q1b1", label: "No pre-norm", options: letters3, correct: 2, exact: 2, uniqueGroup: "q1b", before: tex`<h3>(b) Activation-gradient RMS (6 points; 2 per variant).</h3><p>The shared logarithmic y-axis is broken between $10^{-8}$ and $10^{-6}$.</p>` + figure("q1b", "Gradient RMS across eight blocks: A increases modestly from about 10 to the minus 6, B increases from about 10 to the minus 20, and C is larger in earlier layers and decreases toward the output.") },
        { id: "q1b2", label: "Post-norm", options: letters3, correct: 0, exact: 2, uniqueGroup: "q1b" },
        { id: "q1b3", label: "No residual", options: letters3, correct: 1, exact: 2, uniqueGroup: "q1b" },
      ],
      explanation: `<p><strong>Answer:</strong> (a) No pre-norm: A; Post-norm: B; No residual: C. (b) No pre-norm: C; Post-norm: A; No residual: B.</p><p>Post-norm keeps the activation norms flat, while removing residuals produces much faster, less controlled growth. Without residuals, gradients vanish severely in earlier layers. With post-norm, gradient paths to earlier layers pass through more normalizations and their scale factors, so earlier-layer gradients are smaller. No pre-norm has larger gradients for earlier layers.</p>`,
    },
    {
      id: "q2", title: "RNNs and transformers across depth", difficulty: "Medium", points: 16, rationaleParts: ["(a)", "(b)"],
      prompt: `<p><strong>From A4 Problems 1–2.</strong> Compare the four-block Modern tanh baseline and default eight-block transformer. Train from scratch with the released recipe and the learning rates specified below.</p>`,
      rows: [
        {
          id: "q2a", label: "(a) Larger ratio", options: ["Transformer", "RNN", "Within 50%"], correct: 2, exact: 4,
          before: tex`<h3>(a) Stream growth (4 points).</h3><p>Use the released default LRs: .003 for the transformer and .001 for the RNN, without tuning. Let $x_\ell$ be the stream after complete block $\ell$, including its MLP and depth skips. On the same four held-out sequences, measure $R = \operatorname{RMS}(x_4)/\operatorname{RMS}(x_1)$ for both models.</p><p>RMS averages over batch, time, and features. Which model has the larger $R$ from layer 1 to layer 4? Choose <em>Within 50%</em> if $\max(R_T, R_R)/\min(R_T, R_R) \le 1.50$; otherwise choose the larger ratio.</p>`,
        },
        {
          id: "q2b1", label: "(i) No pre-norm → pre-norm", options: ["Transformer", "RNN", "Similar"], correct: 0, exact: 4,
          before: tex`<h3>(b) Which family benefits more? (12 points; 4 per row).</h3><p>Apply each row to both model families. Here $N$ is the released RMSNorm (transformer) or LayerNorm (RNN). Tune each before/after model independently, using the same grid for every variant within its family:</p><p>All transformer variants: $\{.00075, .0015, .003, .006, .012\}$<br />All RNN variants: $\{.00025, .0005, .001, .002, .004\}$</p><div class="quiz-context-table-wrap quiz-context-table-wide"><table class="quiz-context-table"><thead><tr><th scope="col">Change</th><th scope="col">Before</th><th scope="col">After</th></tr></thead><tbody><tr><th scope="row">(i)</th><td>No pre-norm: $x + F(x)$</td><td>Pre-norm: $x + F(N(x))$</td></tr><tr><th scope="row">(ii)</th><td>Pre-norm: $x + F(N(x))$</td><td>Post-norm: $N(x + F(x))$</td></tr><tr><th scope="row">(iii)</th><td>No RoPE</td><td>RoPE</td></tr></tbody></table></div><p>For each family, compute $I = L^\star_{\mathrm{before}} - L^\star_{\mathrm{after}}$ for $L^\star$ as LR-tuned final validation loss. Choose <em>Transformer</em> if $I_T - I_R \ge .02$ (the transformer benefits more from the intervention), <em>RNN</em> if $I_R - I_T \ge .02$ (the RNN benefits more from the intervention), and <em>Similar</em> if $|I_T - I_R| < .02$ (both have similar benefits).</p>`,
        },
        { id: "q2b2", label: "(ii) Pre-norm → post-norm", options: ["Transformer", "RNN", "Similar"], correct: 1, exact: 4 },
        { id: "q2b3", label: "(iii) No RoPE → RoPE", options: ["Transformer", "RNN", "Similar"], correct: 0, exact: 4 },
      ],
      explanation: `<p><strong>Answer:</strong> (a) Within 50%. (b) (i) Transformer; (ii) RNN; (iii) Transformer.</p><p>The stream norm growth is comparable for both models: activation growth over depth is not specific to attention. The RNN has natural norm control from its tanh components, so normalization has less effect on its training stability or loss. Pre-norm helps the transformer more; post-norm hurts it more, so the RNN has the larger benefit in (ii). RNNs already have temporal structure, whereas positional encodings are much more important for a transformer.</p>`,
    },
    {
      id: "q3", title: "RNNs and transformers across time", difficulty: "Easy", points: 20, rationaleParts: ["(a)", "(b)"],
      prompt: `<p><strong>From A4 Problem 2.</strong> Compare the default transformer, Modern tanh baseline, and GRU.</p>`,
      rows: [
        {
          id: "q3a1", label: "GRU", options: letters3, correct: 0, exact: 4, uniqueGroup: "q3a",
          before: tex`<h3>(a) Context removal (12 points; 4 per curve).</h3><p>Match A–C to GRU, Modern tanh baseline, and transformer, using each once. For each target, retain the most recent $K$ inputs and initial BOS, restart recurrent states, and preserve transformer positions. Score the same final target and subtract its loss with all 1,023 inputs retained. The curves average these paired loss increases over 128 targets. Moving left removes more context.</p>` + figure("q3a", "Context-removal curves A, B, and C: B has the greatest loss increase when context is removed, followed by A, then C. All approach zero with all 1,023 recent inputs retained."),
        },
        { id: "q3a2", label: "Modern tanh baseline", options: letters3, correct: 2, exact: 4, uniqueGroup: "q3a" },
        { id: "q3a3", label: "Transformer", options: letters3, correct: 1, exact: 4, uniqueGroup: "q3a" },
        {
          id: "q3b1", label: tex`Last-token loss gradient: $L = L_T$`, options: letters4, correct: 2, exact: 4, uniqueGroup: "q3b",
          before: tex`<h3>(b) Temporal gradients (8 points; 4 per row).</h3><p>For the Modern tanh baseline, match A–D to the last-token gradient $g_{\mathrm{last}}(t) = \operatorname{RMS}(\partial L_T/\partial h_{1,t})$ and full-loss gradient $g_{\mathrm{full}}(t) = \operatorname{RMS}(\partial\bar L/\partial h_{1,t})$, where $\bar L = T^{-1}\sum_{s=1}^{T} L_s$ with respect to the hidden state in layer 1. Choose exactly one plot per row, using two different letters; the other two plots are distractors.</p><p>Details: RMS averages over batch and hidden features. The panels are normalized, smoothed sketches where we divide each curve by its maximum, then interpolate in log space through 32 time positions. The y-axis is logarithmic.</p>` + figure("q3b", "Four temporal-gradient sketches: A falls then rises, B falls from early to late tokens, C rises from early to late tokens, and D stays approximately flat."),
        },
        { id: "q3b2", label: tex`Full-loss gradient: $L = T^{-1}\sum_{s=1}^{T}L_s$`, options: letters4, correct: 3, exact: 4, uniqueGroup: "q3b" },
      ],
      explanation: `<p><strong>Answer:</strong> (a) GRU: A; Modern tanh baseline: C; Transformer: B. (b) Last-token loss gradient: C; Full-loss gradient: D.</p><p>Transformers make greater use of context and are hurt most by removing tokens. The GRU retains somewhat more useful context than the Modern tanh baseline. For the last-token objective, gradients decrease exponentially with distance from the last token, giving curve C. Averaging the full sequence loss gives a contribution from each token’s objective, producing the roughly flat curve D.</p>`,
    },
    {
      id: "q4", title: "Pinning residual-stream norms", difficulty: "Hard", points: 10,
      prompt: tex`<p><strong>From A4 Problems 1 and 3.</strong> Use the default 8-block transformer. Choose the final loss-regret interval $\Delta = L_{\mathrm{changed}} - L_{\mathrm{control}}$ for the intervention below.</p><h3>Pin stream norms halfway through training.</h3><p>At update 4,688 of the LR .003 baseline, fork two continuations. One continues unchanged. In the other, after each attention/MLP residual addition $y$, apply $y \leftarrow s_j\,y/\operatorname{RMS}(y)$, where $s_j$ is the mean tokenwise RMS on 16 validation sequences at the fork. Compare this constraint with the unchanged continuation at update 9,375. How much does the loss change after this modification?</p><p>Choose the final loss-regret interval $\Delta = L_{\mathrm{changed}} - L_{\mathrm{control}}$.</p>`,
      rows: [{ id: "q4a", label: "Fix stream RMS halfway", options: regretOptions, correct: 1, exact: 10, partial: [0, 2] }],
      explanation: `<p><strong>Answer:</strong> B. The loss gap is 0.0043, effectively no impact from pinning.</p><p>Partway through training, norms are still changing but their depth profile is somewhat stable. Fixing those targets has little effect on final loss. Pinning to the values at initialization instead prevents effective training, so when the norms are pinned matters.</p>`,
    },
    {
      id: "q5", title: "Residual designs across depth", difficulty: "Medium", points: 22, rationaleParts: ["(a)", "(b)"],
      prompt: `<p><strong>From A4 Problems 1 and 3.</strong> Use the default 8-block transformer and released training recipe.</p>`,
      rows: [
        {
          id: "q5a", label: "(a) Only a whole-block skip", options: regretOptions, correct: 3, exact: 10, partial: [2, 4],
          before: tex`<h3>(a) Keep only a whole-block skip (10 points).</h3><p>The default block has an attention skip and an MLP skip:</p><p>$u = x + A(N_1(x))$, $y = u + M(N_2(u))$,</p><p>where $A$ is attention, $M$ is the MLP, and $N_1$, $N_2$ are RMSNorms. Replace this rule by</p><p>$y = x + M(N_2(A(N_1(x))))$,</p><p>removing both internal skips and keeping one skip from the block input $x$ to its output $y$. Train from scratch and tune over $\{.001, .003, .009\}$; compare with the separately tuned default transformer. Choose the final loss-regret interval $\Delta = L_{\mathrm{changed}} - L_{\mathrm{control}}$.</p>`,
        },
        {
          id: "q5b", label: "(b) Routing pattern", options: letters4, correct: 3, exact: 12,
          before: `<h3>(b) Read across depth (12 points).</h3><p>Separately train the full default attention-residual transformer at LR .006. Which strip best matches the final read router’s attention over sources, immediately before the output norm/head?</p><p>Source 0 is the embedding; sources 1–16 are the raw attention/MLP outputs in depth order (odd: attention; even: MLP). Average over all 1,023 input positions of four held-out sequences. One strip is measured; three are constructed alternatives. Box values are rounded percentages, with a shared color scale.</p>` + figure("q5b", "Four attention strips over sources 0 through 16. A puts 55% on source 16, C puts 55% on source 0, and B and D show different distributed weight patterns. Each cell displays its rounded percentage."),
        },
      ],
      explanation: `<p><strong>Answer:</strong> (a) D, about 0.1 loss regret. (b) D.</p><p>A skip around the whole block still permits training, but costs about 0.1 loss compared with separate attention and MLP residuals. Each block is only two sublayers, so removing its internal skips is not catastrophic. The measured final-read attention in (b) pays somewhat more attention to later sources. Later layers already contain information from earlier layers; the strongest source is attention source 15 at 23.3%.</p>`,
    },
    {
      id: "q6", title: "Changing the recurrent update", difficulty: "Hard", points: 20, rationaleParts: ["(a)", "(b)"],
      prompt: tex`<p><strong>From A4 Problem 4.</strong> Change the temporal update of the modern tanh baseline. Here $x_t$ is the normalized input to a recurrent cell and $h_t$ is its internal state carried to the next time step, before the depth MLP. Every layer starts with $h_0 = 0$ and has its own learned weights.</p>`,
      rows: [
        {
          id: "q6a", kind: "ranking", label: "(a) Rank four designs", exact: 12, correctOrder: ["D", "A", "C", "B"],
          before: tex`<h3>(a) Rank four designs (12 points).</h3><p>Let $c_t = \tanh(Wx_t + Uh_{t-1} + b)$.</p><p>A: <strong>Modern tanh baseline</strong> $h_t = c_t$,<br />B: <strong>Time residual</strong> $h_t = h_{t-1} + c_t$,<br />C: <strong>Normalized time residual</strong> $s_t = h_{t-1} + c_t$, $h_t = s_t/\sqrt{\frac{1}{512}\sum_{j=1}^{512}s_{t,j}^2 + 10^{-5}}$,<br />D: <strong>Full GRU</strong> update below.</p><p>The full GRU update is</p><p>$r_t = \sigma(W_rx_t + U_rh_{t-1} + b_r)$,<br />$z_t = \sigma(W_zx_t + U_zh_{t-1} + b_z)$,<br />$\tilde h_t = \tanh(W_hx_t + U_h(r_t\odot h_{t-1}) + b_h)$,<br />$h_t = (1-z_t)\odot h_{t-1} + z_t\odot\tilde h_t$.</p><p>Here $\sigma$ is sigmoid and $\odot$ is elementwise multiplication.</p><p>Tune <strong>all four designs</strong> over the same LR grid $\{.001, .002, .004\}$. Let $L_A^\star, \ldots, L_D^\star$ be their best final validation losses. Rank lowest to highest loss, using &gt;, &lt;, and = (for losses within 0.01). Each correctly ordered pair earns 2 points.</p>`,
        },
        {
          id: "q6b", label: "(b) Loss gap", options: [tex`A: $\Delta \le 0$`, tex`B: $0 < \Delta \le .05$`, tex`C: $.05 < \Delta \le .10$`, tex`D: $.10 < \Delta \le .15$`, tex`E: $\Delta > .15$`], correct: 4, exact: 8, partial: [3],
          before: tex`<h3>(b) Fixed versus learned write gate (8 points).</h3><p>Keep the GRU’s learned reset gate and candidate. Replace its write gate by a constant $z$, shared across all channels, layers, and time steps:</p><p>$h_t = (1-z)h_{t-1} + z\tilde h_t$, $h_0 = 0$.</p><p>Train from scratch, tuning $z\in\{0.0, 0.25, 0.5, 0.75, 1.0\}$ and LR $\eta\in\{.001, .002, .004\}$. Compare the best fixed-$z$ model with the full GRU from (a), tuned over the same LR grid. Which interval contains the final validation loss gap $\Delta = \min_{z,\eta}L_{\mathrm{fixed}}(z,\eta) - \min_\eta L_{\mathrm{GRU}}(\eta)$?</p>`,
        },
      ],
      explanation: tex`<p><strong>Answer:</strong> (a) D &lt; A &lt; C &lt; B: GRU &lt; Modern tanh baseline &lt; Normalized time residual &lt; Time residual. (b) E: $\Delta = +0.1982$.</p><p>Best final losses in (a) are D: 3.1813, A: 3.5160, C: 3.5565, and B: 5.4757. Adding temporal residuals accumulates hidden-state norm and can produce unstable gradients. Normalization improves that stability but still hurts performance relative to the baseline.</p><p>The tuned fixed write gate significantly underperforms the learned, input-dependent gate. Fixed values .25, .5, and .75 perform similarly, whereas learned gates vary across layers and inputs and often approach 0 or 1. Their ability to turn writing on and off matters beyond the mean gate value.</p>`,
    },
  ];

  const appendix = {
    q1: tex`Select complete block outputs from each released variant's LR-selected checkpoint.
--- a/experiments/a4_stability/diagnostics.py
+++ b/experiments/a4_stability/diagnostics.py
@@ -141,2 +141,8 @@
     path.parent.mkdir(parents=True, exist_ok=True)
     path.write_text(json.dumps(clean(value), indent=2, allow_nan=False)+'\n')
+
+
+def block_norms(report, field):
+    import numpy as np
+    # Every block has two branches; omit embeddings and the readout norm.
+    return np.array([row[field] for row in report['full']['depth'][2::2]])`,
    q2: tex`Q2(a): default LRs .003/.001 (transformer/RNN).
Q2(b): tune on the listed grids; compute before-minus-after loss.
--- a/experiments/a4_stability/diagnostics.py
+++ b/experiments/a4_stability/diagnostics.py
@@ -141,2 +141,9 @@
     path.parent.mkdir(parents=True, exist_ok=True)
     path.write_text(json.dumps(clean(value), indent=2, allow_nan=False)+'\n')
+
+
+def depth_ratio(first_block, last_block):
+    return last_block/first_block
+
+def loss_gain(before, after):
+    return before-after`,
    q3: tex`Use the release's context_loss(model, tokens, K, preserve_first=True) on 128 paired targets.
Its profile already computes both full-loss and last-token gradients while retaining the true internal
recurrent states. Use the first four validation sequences from the Modern tanh baseline.
For the displayed sketches, normalize each curve and interpolate in log space through 32 sampled
time positions.
--- a/experiments/a4_stability/diagnostics.py
+++ b/experiments/a4_stability/diagnostics.py
@@ -141,2 +141,17 @@
     path.parent.mkdir(parents=True, exist_ok=True)
     path.write_text(json.dumps(clean(value), indent=2, allow_nan=False)+'\n')
+
+
+def context_increase(truncated, full):
+    import numpy as np
+    return np.asarray(truncated)-np.asarray(full)
+
+def temporal_sketch(report, objective):
+    import numpy as np
+    # The release profile already differentiates both objectives and retains h_t.
+    # Display a normalized sketch with log interpolation through 32 time positions.
+    g=np.array(report[objective]['hidden_gradient_rms'][0])
+    logg=np.log10(np.maximum(g/g.max(),1e-18))
+    knots=np.linspace(0,len(g)-1,32).astype(int)
+    smooth=10**np.interp(np.arange(len(g)),knots,logg[knots])
+    return smooth/smooth.max()`,
    q4: tex`Fork update 4,688 including optimizer and RNG state. Measure 16 RMS values s_j in FP32
on the first 16 validation sequences, then fix these targets and rescale each residual output
to its target RMS. All weights keep learning. Continue both branches to 9,375 with the same
batches and remaining LR schedule.
--- a/experiments/a4_stability/p1_transformer_depth.py
+++ b/experiments/a4_stability/p1_transformer_depth.py
@@ -213,2 +213,19 @@
     from .sweeps import launch_one
     launch_one('d8') # Edit the variant and LR, e.g. ('d8-no-residual', .001).
+
+
+class PinnedNormTransformer(Transformer):
+    """Freeze residual RMS targets; existing learned RMSNorm gains keep training."""
+    def __init__(self, config, *, targets=None, **kwargs):
+        super().__init__(config, **kwargs)
+        self.targets = None if targets is None else tuple(targets)
+        if self.targets is not None:
+            assert len(self.targets) == len(self.branches())
+
+    def run_depth(self, x, **context):
+        for j, branch in enumerate(self.branches()):
+            x = branch(x, **context)
+            if self.targets is not None:
+                scale = x.float().square().mean(-1, keepdim=True).clamp_min(1e-12).rsqrt()
+                x = x * (self.targets[j]*scale).to(x.dtype)
+        return x`,
    q5: tex`For (a), keep a skip around each complete attention-MLP composition, removing its internal
skips. Train from scratch on the stated three-rate grid.
--- a/experiments/a4_stability/p1_transformer_depth.py
+++ b/experiments/a4_stability/p1_transformer_depth.py
@@ -213,2 +213,12 @@
     from .sweeps import launch_one
     launch_one('d8') # Edit the variant and LR, e.g. ('d8-no-residual', .001).
+
+
+class BlockSkipTransformer(Transformer):
+    """Only the whole block has a skip: x + M(N2(A(N1(x))))."""
+    residual_type = NoResidual
+
+    def run_depth(self, x, **context):
+        for block in self.model.layers:
+            x = x + block(x, **context)
+        return x

For (b), use the released AttentionTransformer, with block size 1, at LR .006. Apply the
release's profile(model, tokens) to four validation sequences; the helper selects the final
read's mean routing weights. The model is unchanged. The three distractors are synthetic
probability vectors.
--- a/experiments/a4_stability/diagnostics.py
+++ b/experiments/a4_stability/diagnostics.py
@@ -141,2 +141,8 @@
     path.parent.mkdir(parents=True, exist_ok=True)
     path.write_text(json.dumps(clean(value), indent=2, allow_nan=False)+'\n')
+
+
+def final_read_weights(report):
+    # Full 8-block AttnRes: embedding plus 16 raw attention/MLP outputs.
+    # The released profile already averages each router over batch and time.
+    return report['routing']['routers.16.softmax']`,
    q6: tex`A is the Modern tanh baseline (released ModernRNN); D is the released GRU. The subclasses
below keep the modern depth stack and change only the recurrent update. The reset gate stays
learned for every fixed write gate z. All designs in Q6(a) and Q6(b) use the same LR grid
{.001, .002, .004} and the release's linear schedule.
--- a/experiments/a4_stability/p4_recurrent_updates.py
+++ b/experiments/a4_stability/p4_recurrent_updates.py
@@ -61,2 +61,43 @@
     from .sweeps import launch_one
     launch_one('gru') # Edit the variant and LR here.
+
+
+class ConstantWrite(nn.Module):
+    def __init__(self, value=1.):
+        super().__init__()
+        self.value = value
+
+    def project(self, x):
+        return x[..., :1]
+
+    def forward(self, projected, h):
+        return self.value
+
+class FixedWriteCell(GRUCell):
+    def make_update(self, config):
+        return ConstantWrite()
+
+class FixedWriteGRU(GRU):
+    """Learn the reset gate and candidate; fix the write gate z."""
+    cell_type = FixedWriteCell
+
+    def __init__(self, config, *, write=.5, **kwargs):
+        super().__init__(config, **kwargs)
+        assert 0 <= write <= 1
+        for block in self.stack:
+            block.recurrent.operation.cell.update.value = write
+
+class TimeResidualCell(TanhCell):
+    def step(self, projected, h):
+        return h + super().step(projected, h)
+
+class NormalizedTimeResidualCell(TimeResidualCell):
+    def step(self, projected, h):
+        y = super().step(projected, h)
+        return y * (y.float().square().mean(-1, keepdim=True)+1e-5).rsqrt().to(y.dtype)
+
+class TimeResidualRNN(ModernRNN):
+    cell_type = TimeResidualCell
+
+class NormalizedTimeResidualRNN(ModernRNN):
+    cell_type = NormalizedTimeResidualCell`,
  };

  const form = document.getElementById("quiz-form");
  const container = document.getElementById("quiz-questions");
  const validationError = document.getElementById("quiz-validation-error");
  const results = document.getElementById("quiz-results");
  const scoreElement = document.getElementById("quiz-score");
  const scoreSummary = document.getElementById("quiz-score-summary");
  const resetButton = document.getElementById("reset-quiz");
  const storageKey = "cs312-stability-quiz-draft-v1";
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
      return `${introduction}<fieldset class="quiz-part" id="row-${row.id}"><legend class="quiz-part-title">${row.label}</legend><label for="ranking-${row.id}">Use A, B, C, and D once each, separated by &lt;, &gt;, or =. Use one direction throughout, with = for ties.</label><input class="quiz-ranking-input" id="ranking-${row.id}" type="text" name="${row.id}" placeholder="e.g. A &lt; B = C &lt; D" autocomplete="off" spellcheck="false" aria-describedby="ranking-help-${row.id}" required /><p class="quiz-scoring-note" id="ranking-help-${row.id}">Each of the six correctly ordered pairs earns 2 points.</p></fieldset>`;
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
    return `<details class="quiz-diff"><summary>The diff (Appendix A.${question.id.slice(1)})</summary><pre><code>${lines}</code></pre></details>`;
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
        ? "In Q6(a), rank A, B, C, and D once each using < or > throughout, with = for ties."
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
        const correctRanks = Object.fromEntries(row.correctOrder.map((name, index) => [name, index]));
        const names = ["A", "B", "C", "D"];
        const relation = (a, b) => a < b ? "&lt;" : a > b ? "&gt;" : "=";
        for (let i = 0; i < names.length; i += 1) {
          for (let j = i + 1; j < names.length; j += 1) {
            const a = names[i], b = names[j];
            const earned = Math.sign(ranks[a] - ranks[b]) === Math.sign(correctRanks[a] - correctRanks[b]) ? 2 : 0;
            points += earned;
            details.push(`${row.label}, ${a}/${b}: ${earned}/2 — your answer: ${a} ${relation(ranks[a], ranks[b])} ${b}; answer: ${a} ${relation(correctRanks[a], correctRanks[b])} ${b}`);
          }
        }
      } else {
        const selected = Number(form.elements.namedItem(row.id).value);
        const earned = selected === row.correct ? row.exact : row.partial?.includes(selected) ? row.exact / 2 : 0;
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
