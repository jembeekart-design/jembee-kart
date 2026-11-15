# Verified textbook question ingestion

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

## Question source labels

Every Question node may carry:
- `questionNumber`: printed number or a stable identifier such as `JP-1`
- `sourceType`: `jembee-practice`, `user-authored`, `open-license`, or `permissioned-textbook`
- `sourceReference`: HTTPS source URL or attribution reference
- `licenseName`: required for `open-license`
- `rightsVerified`: must be true for `permissioned-textbook`

The API rejects a permissioned textbook question unless an Admin supplies `rightsVerified: true` and an HTTPS source reference. Open-license questions require a license name and HTTPS source reference. This is an Admin-only master-catalog operation.

Example JSON entry for an independently authored question:

```json
{
  "id": "malhar-ch-01-jp-2",
  "type": "question",
  "name": "JEMBEE PLAY Practice Q2 — Write an original question here.",
  "parentId": "ncert-g6-malhar-ch-01",
  "questionNumber": "JP-2",
  "sourceType": "jembee-practice"
}
```

Example metadata for a question whose reuse has been explicitly licensed (do not use until permission is actually obtained):

```json
{
  "id": "malhar-ch-01-textbook-q1",
  "type": "question",
  "name": "Question text supplied under documented permission",
  "parentId": "ncert-g6-malhar-ch-01",
  "questionNumber": "1",
  "sourceType": "permissioned-textbook",
  "sourceReference": "https://example.org/permission-record",
  "rightsVerified": true
}
```

The example URL is illustrative only and must be replaced with the real permission/source record. Uploading a PDF or photograph does not itself grant redistribution rights. Do not copy NCERT exercise wording into the commercial platform unless written permission covering that use has been obtained. Until then, keep independently authored prompts clearly labelled as JEMBEE PLAY Practice, and do not describe them as NCERT exercise questions.

## Import behaviour

Use the existing Admin Learning Library JSON import. Parent chapter IDs must already exist or be included in the same import. The existing stable IDs and parent-child checks remain in force. Re-importing must not silently republish Admin-unpublished entries.
