# Document Extraction: Approach and Reasoning

## Overall Strategy

I approached this assessment as someone unfamiliar with EPDs and carbon accounting. Rather than diving straight into extraction, I used Claude to build up my domain knowledge so I can understand what I'm looking at.

My process:
1. **Domain learning** - Asked Claude to walk me through the EPD PDFs, the brief markdown, explaining what each section meant and why it mattered. From here I learned what lifecycle stages are, how carbon footprint are measured etc.
2. **Q&A rounds** - Clarified my understanding of life cycle stages (A1-D), declared vs undeclared values, and what makes data comparable
3. **Batch extraction** - Had Claude extract each PDF into JSON files with schema it thinks is most appropriate.
5. **Verification** - Manually spot-checked samples against source PDFs, making sure not only accuracy, but the required context are captured.

## Model and Architecture

I used Claude for both learning and extraction. The key decision was treating it as a collaborator rather than a black box:

I used Claude, simply because 
1. I can use it locally without needing to upload PDFs to a website somewhere
2. There's little differentiating factors since I am going to double check all of the work.
3. I'm already paying for it.
4. I'm familiar with it.

## Accuracy

Every number traces back to its source EPD via the `epd.id` and `epd.source_file` fields.

Verification approach:
- **Manual spot-checks**: Sampled several EPDs and compared extracted values against the original PDFs
- **Cross-validation**: Checked that extracted totals (A1-A3, C1-C4) matched the sum of individual stages
- **Declared vs missing**: Explicitly marked undeclared stages as `declared: false` with `null` values - a missing stage is not zero

## Research and Process

I think this can be best explained by first examining the timeline of the questions asked

My conversation with Claude, chronologically

1. read the brief markdown first
2. start part 1, but start with just one pdfs first so I can verify the data against the original pdf
3. walk me through the JSON file, explaining the main fields that address the main concern of the brief
4. (once I understood the JSON file, I manually then check the first JSON file against the original PDF)
5. do the same for all pdfs
6. what other metrics should I look at other than GWP?
7. reading all the data/*.json, how different are the concretes here? do most of them belong to the same category?
8. what do the compressive_strength.class mean?
9. do part 2 of the assesment according to the markdown brief 

...the rest of the conversation is back and forth on improving the UIUX of the site.