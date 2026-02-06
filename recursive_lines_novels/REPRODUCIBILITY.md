# Reproducibility Checklist

To ensure result validity for FAccT/AIES review, please adhere to the following environment configurations.

## 1. Dependencies
The system relies on lightweight scientific computing libraries.

**`technical/requirements.txt`**
```text
numpy>=1.24.0
matplotlib>=3.7.1
seaborn
scipy
pandas
PyYAML
networkx>=3.1
requests
beautifulsoup4  # HTML sanitization
lxml            # HTML parser backend
joblib          # Parallel processing (loky backend)

# Optional: for neural narrative analysis
torch>=2.0.0
sentence-transformers>=2.2.2
```

For detailed documentation of all pipeline algorithms, see [`docs/methodologies.md`](docs/methodologies.md).

**CLI Dependencies (Node.js)**
```text
chalk>=5.0
cheerio>=1.0
```

## 2. Seed Configuration
To reproduce the **Agency Phase Transition Heatmap** exactly as it appears in the paper:

*   **Script:** `technical/agency_phase_transition.py`
*   **Seed:** `42` (Hardcoded in `nx.spring_layout(..., seed=42)`)
*   **Command:**
    ```bash
    cd technical
    python agency_phase_transition.py
    ```

## 3. Data Sanitation (Critical)
The dataset pipeline requires HTML sanitization to extract narrative content and prevent CSS/JS pollution.

**Problem:** Raw HTML ingestion causes the Pathology Map to be dominated by CSS tokens (`padding`, `margin`, `rgba`) instead of semantic concepts.

**Solution:** `technical/build_dataset.py` uses BeautifulSoup to:
1. Strip `<script>`, `<style>`, `<meta>`, `<svg>` tags
2. Extract semantic classes (`.narrative`, `.message`, `.code-block`)
3. Fall back to paragraph text if no specific classes found

**Verification:**
```bash
cd technical
pip install -r requirements.txt
python build_dataset.py
```

**Success Indicators:**
- `train.csv` should be KB-sized (not MB)
- Content shows narrative text, not CSS properties
- NPS4 Scanner produces semantic nodes (Baby, Envy, Agency)

## 4. Data Integrity
*   **MD5 Checksums:**
    *   `agency_phase_transition.py`: `df9952da50e202d3b4d3cea13385528a`
    *   `nps4_scanner.py`: `5ec043cfee2152e7ebfb3bccdf3d7f50`
    *   `build_dataset.py`: `3b7f2c191c5173e239b3a45eea70fb20`

## 5. State Machine Validation
To verify the "Session Accumulation" logic in the CLI:
1.  Run `./play.sh`
2.  Attempt to access `Limbo` immediately (Should fail).
3.  Modify `cli/.state.json` to include all file paths in `requiredForLimbo`.
4.  Access `Limbo` (Should succeed).

This confirms the Layer 2 constraint enforcement logic is active.
