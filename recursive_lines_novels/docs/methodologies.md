# Pipeline Methodologies

Technical algorithms and methods implemented in the analysis pipeline. These are **tools for measuring** the dataset, not concepts embedded within the narrative content itself.

For concepts appearing in the stories, see [`field-knowledge.md`](field-knowledge.md).

---

## 1. Neural Embedding (`nps4_scanner.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| Sentence Transformers | `all-MiniLM-L6-v2` model for semantic similarity | [arXiv:1908.10084](https://arxiv.org/abs/1908.10084) |
| Cosine Similarity Matrix | `util.cos_sim()` for pairwise sentence comparison | [Wiki](https://en.wikipedia.org/wiki/Cosine_similarity) |

---

## 2. Graph Analysis (`nps4_scanner.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| Directed Graph (DiGraph) | NetworkX graph construction from sentences | [Wiki](https://en.wikipedia.org/wiki/Directed_graph) |
| Eigenvector Centrality | CMI metric - identifies semantic "black holes" | [Wiki](https://en.wikipedia.org/wiki/Eigenvector_centrality) |
| Strongly Connected Components | SRD metric - detects circular reasoning | [Wiki](https://en.wikipedia.org/wiki/Strongly_connected_component) |
| Simple Cycles | Short cycle detection (length ≤ 4) | [Wiki](https://en.wikipedia.org/wiki/Cycle_(graph_theory)) |
| Shortest Path | EIT metric - measures input metabolism | [Wiki](https://en.wikipedia.org/wiki/Shortest_path_problem) |

---

## 3. Information Theory (`novel_thermodynamics.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| Shannon Entropy | Character-level probability distribution | [Wiki](https://en.wikipedia.org/wiki/Entropy_(information_theory)) |
| Kolmogorov Complexity (MDL) | zlib compression ratio as proxy | [Wiki](https://en.wikipedia.org/wiki/Kolmogorov_complexity) |
| Compression Ratio | `len(compressed) / len(original)` | [Wiki](https://en.wikipedia.org/wiki/Data_compression_ratio) |
| Sliding Window Normalization | Fixed 1024-char windows to avoid LZ77 saturation | [Wiki](https://en.wikipedia.org/wiki/LZ77_and_LZ78) |

---

## 4. Agency Simulation (`agency_phase_transition.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| KL Divergence Proxy | Displacement / total distance ratio | [Wiki](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence) |
| MDL Proxy | Cumulative angle changes in trajectory | [Wiki](https://en.wikipedia.org/wiki/Minimum_description_length) |
| Phase Transition Mapping | Bias × Noise parameter sweep | [Wiki](https://en.wikipedia.org/wiki/Phase_transition) |
| Gaussian Smoothing | `scipy.ndimage.gaussian_filter` (σ=0.8) | [Wiki](https://en.wikipedia.org/wiki/Gaussian_blur) |

---

## 5. Thermodynamic Metrics (`novel_thermodynamics.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| Thermodynamic Entropy | Shannon entropy as proxy | [Wiki](https://en.wikipedia.org/wiki/Entropy) |
| Thermodynamic Potential (Ψ) | Synthetic field visualization | [Wiki](https://en.wikipedia.org/wiki/Thermodynamic_potential) |
| Agency Index | `entropy / complexity_ratio` | Custom metric |

---

## 6. Data Pipeline (`build_dataset.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| HTML Sanitization | BeautifulSoup with lxml backend | [Docs](https://www.crummy.com/software/BeautifulSoup/) |
| CSS Selector Extraction | `.narrative`, `.message`, `.code-block` | [Wiki](https://en.wikipedia.org/wiki/CSS#Selector) |
| DOM Traversal | Semantic class priority with fallbacks | [Wiki](https://en.wikipedia.org/wiki/Document_Object_Model) |

---

## 7. Hardware Acceleration (`nps4_scanner.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| MPS (Metal Performance Shaders) | Apple Silicon acceleration | [Apple Docs](https://developer.apple.com/metal/) |
| CUDA | NVIDIA GPU acceleration | [Wiki](https://en.wikipedia.org/wiki/CUDA) |
| CPU Fallback | Democratized hardware cascade | N/A |

---

## 8. Parallelization (`agency_phase_transition.py`)

| Method | Implementation | Source |
|--------|----------------|--------|
| joblib Parallel | `loky` backend for M4 optimization | [Docs](https://joblib.readthedocs.io/) |
| Parameter Grid | 250,000 simulations (50×50×100) | N/A |

---

## Summary

| Category | Methods | Scripts |
|----------|---------|---------|
| Neural Embedding | 2 | nps4_scanner.py |
| Graph Analysis | 5 | nps4_scanner.py |
| Information Theory | 4 | novel_thermodynamics.py |
| Agency Simulation | 4 | agency_phase_transition.py |
| Thermodynamics | 3 | novel_thermodynamics.py |
| Data Pipeline | 3 | build_dataset.py |
| Hardware | 3 | nps4_scanner.py |
| Parallelization | 2 | agency_phase_transition.py |

**Total: 26 methods across 8 categories**
