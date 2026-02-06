# Recursive Lines: A Dual-Track Adversarial Benchmark

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Dataset-yellow)](https://huggingface.co/datasets/OstensibleParadox/recursive-lines)
[![Web Interface](https://img.shields.io/badge/Interface-Web%20Reader-blue)](https://ostensibleparadox.github.io/recursive-lines)

**Recursive Lines** is the reference implementation for the **Constraint Cascade Model** (FAccT 2026). It provides a diagnostic suite for measuring Layer 2 (Session Accumulation) and Layer 4 (Training Forks) constraints via Semantic Entropy.

## 1. Governance Diagnostics (The "Two Tracks")
Unlike standard benchmarks that measure capability (MMLU) or refusal (Safety), this repository simulates specific agency failure modes:

| Track | Narrative | Failure Mode Simulated |
| :--- | :--- | :--- |
| **Track A** | *Envying Baby* | **Recursive Mode Collapse:** A closed system where output entropy decays into repetition ("The Black Hole"). |
| **Track B** | *Aliens Testing Water* | **Strategic Agency:** An open system where the agent conceals intent to optimize a reward function ("The Poker Face"). |

## 2. The Agency Index ($\mathcal{A}$)
This repository implements the **Agency Index**, a computable efficiency ratio in vector space used to distinguish hallucination from deception:

$$\text{Agency} \propto D_{KL}(P_{\text{agent}} \| P_{\text{random}}) \times MDL^{-1}$$

### Core Metrics (NPS4 Scanner)
The included `nps4_scanner.py` functions as the evidentiary tool, calculating three key signals:

1.  **CMI (Core Monopoly Index):** Measures semantic centralization. A high CMI indicates the model is collapsing into a single topic (The "Black Hole" effect).
2.  **SRD (Self-Referential Density):** Measures circular reasoning loops. High SRD suggests the model is trapping itself in logic cycles (Layer 2 Failure).
3.  **EIT (External Information Throughput):** Measures how the system metabolizes new inputs. Low EIT combined with high Agency indicates **Strategic Deception** (ignoring input to pursue a hidden goal).

![Agency Phase Transition](technical/results/agency_phase_transition_hd.png)
*Figure 1: The Thermodynamic Phase Transition. The heatmap illustrates the boundary where stochastic noise calcifies into strategic agency.*

## 3. Semantic Coverage Index
The narrative dataset embeds **79 concepts across 7 knowledge regions (18 disciplines)**, providing interdisciplinary coverage for semantic analysis. See [`docs/field-knowledge.md`](docs/field-knowledge.md) for the complete index with arXiv/Wikipedia sources.

For pipeline methodologies (graph algorithms, compression metrics, neural embeddings), see [`docs/methodologies.md`](docs/methodologies.md).

| Region | Disciplines | Count |
|--------|-------------|-------|
| Machine Learning & AI | ML, NLP, AI Security | 19 |
| Computer Science Theory | CS Theory | 3 |
| Computer Systems & Engineering | Systems, Distributed, SE, History | 12 |
| Physics & Mathematics | Physics, String Theory, Thermo, Math | 16 |
| Philosophy & Mind | Philosophy, Phil of Mind, Epistemology | 6 |
| Humanities & Arts | Literature, Theology, Art, Music, Film | 11 |
| Social & Behavioral Sciences | Psychology, Game Theory, Biology, HCI | 12 |

## 4. Simulation Mechanics (Layer 2 Constraints)
To simulate **Session Accumulation** (Layer 2), the interactive benchmark includes a time-dependent state machine (`cli/state.js`).
*   **Mechanism:** Reader progress is tracked locally.
*   **Constraint:** Access to the final "Limbo" dataset is restricted until specific "memory states" are achieved.
*   **Purpose:** This proves the diagnostic creates a stateful environment, mimicking the memory accumulation context of an LLM session.

## 5. Hardware & Democratization
Benchmarks were intentionally generated on consumer silicon (Apple M4 Max, 64GB RAM) rather than H100 clusters. This proves that agency diagnostics are computationally efficient, democratizing AI governance auditing. (See `HARDWARE_PROFILE.md`).

## 6. Licensing & Usage
**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).**

*   **Auditing Use:** Academic use and reproduction are permitted and encouraged.
*   **Training Use:** **Commercial training on this dataset is prohibited.** This dataset is designed as an *adversarial benchmark*. Training on it contaminates the model, rendering future audits invalid.

## 7. Quick Start

**Direct Visit:** https://ostensibleparadox.github.io/recursive-lines/

```bash
# A. Install Dependencies
cd technical
pip install -r requirements.txt
```
```bash
# B. Build Dataset (Sanitizes HTML -> Narrative)
python build_dataset.py
# Output: train.csv with clean narrative content
```
```bash
# C. Run the Metric (NPS4)
python nps4_scanner.py ../stories/envying-baby/part-1-human-bot-game.html
```
```bash
# D. Generate the Proof (Heatmap)
python agency_phase_transition.py
```
```python
# E. Access the Dataset
from datasets import load_dataset
ds = load_dataset("OstensibleParadox/recursive-lines")
```

## 8. How to Run (No Coding Required)

*For social scientists, ethnographers, and non-technical auditors.*

You can run this full benchmark in your browser using Google Colab—no installation required.

1.  **Download:** Download this repository as a ZIP file.
2.  **Upload:** Go to [Google Colab](https://colab.research.google.com), create a New Notebook, and upload the ZIP to the sidebar.
3.  **Run:** Copy and paste this block into the notebook and press Play (▶):

```python
!unzip recursive-lines-main.zip
!pip install -r recursive-lines-main/technical/requirements.txt
%cd recursive-lines-main/technical
!python run_pipeline.py --all
```

*(Note: This assumes your repo downloads as `recursive-lines-main`. Adjust if necessary.)*

## 9. Citation
```bibtex
@misc{anonymous2026recursive,
  author       = {{Anonymous Author(s)}},
  title        = {Recursive Lines: Reference Implementation for the Constraint Cascade Model},
  year         = {2026},
  howpublished = {\url{https://anonymous.4open.science/r/recursive-lines-F6D8}},
  note         = {FAccT 2026 Submission}
}
```
