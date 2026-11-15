# Verified textbook metadata and teacher question-number entry

## Malhar Grade 6 chapter catalog

The existing NCERT Grade 6 starter dataset already contains the Malhar book and its 13 chapter metadata records. Chapter titles are metadata only; no textbook pages, exercise text, answer keys, or official cover images are bundled.

1. मातृभूमि
2. गोल
3. पहली बूँद
4. हार की जीत
5. रहीम के दोहे
6. मेरी माँ
7. जलाते चलो
8. सत्रिया और बिहू नृत्य
9. मैया मैं नहि माखन खायो
10. परीक्षा
11. चेतक की वीरता
12. हिंद महासागर में छोटा सा हिंदुस्तान
13. पेड़ की बात

Reference: https://ncert.philoid.app/book/fhml1

## Teacher question-number flow

Teachers do not need Admin to pre-enter textbook exercise questions. The teacher selects the existing Subject, Book and Chapter, then types the number printed next to the exercise question (for example `1`, `1(a)`, or `Q.2`). The platform saves the original label and a normalized key against the video submission. After Admin approval, the Learning Library discovers that number from approved videos and groups all matching teacher answers.

The question number is only a locator. Do not copy textbook question wording, page images, answer keys or official covers into JEMBEE PLAY unless the platform has the required commercial reuse permission.

## Optional legacy Question-node source labels

Existing Admin-created Question nodes remain supported for backward compatibility. If an Admin chooses to maintain separate question text records, each Question node may carry:

- `questionNumber`: printed number or a stable identifier such as `JP-1`
- `sourceType`: `jembee-practice`, `user-authored`, `open-license`, or `permissioned-textbook`
- `sourceReference`: HTTPS source URL or attribution reference
- `licenseName`: required for `open-license`
- `rightsVerified`: must be true for `permissioned-textbook`

The API rejects a permissioned textbook question unless an Admin supplies `rightsVerified: true` and an HTTPS source reference. Open-license questions require a license name and HTTPS source reference. This metadata workflow is optional and is not part of the normal teacher upload path.

## Import behaviour

Use the existing Admin Learning Library JSON import for Subject, Book and Chapter master records. Parent IDs must already exist or be included in the same import. Re-importing must not silently republish Admin-unpublished entries. Existing legacy Question nodes and videos linked to them remain readable.
