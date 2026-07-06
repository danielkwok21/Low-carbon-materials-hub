# Document Extraction: Approach and Reasoning

## Overall Strategy

I approached this assessment as someone unfamiliar with EPDs and carbon accounting. Rather than diving straight into extraction, I used Claude as a domain expert to first understand what I was looking at.

My process:
1. **Domain learning** - Asked Claude to walk me through the EPD PDFs, explaining what each section meant and why it mattered
2. **Q&A rounds** - Clarified my understanding of life cycle stages (A1-D), declared vs undeclared values, and what makes data comparable
3. **Schema definition** - Once I understood the domain, I defined a JSON schema that would capture everything needed for meaningful comparison
4. **Batch extraction** - Had Claude extract each PDF into the defined schema
5. **Verification** - Manually spot-checked samples against source PDFs

This "understand first, extract second" approach meant I could catch errors because I knew what correct data should look like.

## Model and Architecture

I used Claude for both learning and extraction. The key decision was treating it as a collaborator rather than a black box:

- **Why Claude over OCR pipelines**: EPDs aren't just text extraction problems. The same number means different things in different contexts (A1-A3 total vs full lifecycle). Claude could interpret context, not just read characters.
- **Why not fine-tuned models**: With 20 documents and no training data, prompt-based extraction was more practical than building a specialised pipeline.
- **Trade-off accepted**: This approach doesn't scale to thousands of documents, but that wasn't the requirement.

## Accuracy

Every number traces back to its source EPD via the `epd.id` and `epd.source_file` fields.

Verification approach:
- **Manual spot-checks**: Sampled several EPDs and compared extracted values against the original PDFs
- **Cross-validation**: Checked that extracted totals (A1-A3, C1-C4) matched the sum of individual stages
- **Declared vs missing**: Explicitly marked undeclared stages as `declared: false` with `null` values - a missing stage is not zero

What could go wrong:
- **Transcription errors**: Claude might misread a value. Mitigated by spot-checking.
- **Context misinterpretation**: A value might be extracted from the wrong table. Mitigated by including stage names in the schema for sanity-checking.
- **Unit inconsistency**: All values are normalised to kg CO2e per 1 m³. The schema enforces this.

## Research and Process

Starting without domain knowledge was actually useful - it forced me to question assumptions:

- **Why some stages are blank**: Learned that B1-B7 (use phase) is typically not declared for concrete because the product is inert in use
- **Why Stage D can be negative**: Benefits from recycling/reuse are credited back, reducing net impact
- **Why A1-A3 alone isn't enough**: Transport and installation (A4-A5) plus end-of-life (C1-C4) can significantly change the comparison

The Q&A process also revealed what the app needed to communicate: that missing data is not zero data, and that comparisons must use matching stage boundaries.
