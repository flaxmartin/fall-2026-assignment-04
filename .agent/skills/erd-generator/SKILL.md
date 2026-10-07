---
name: erd-generator
description: Generates and validates Mermaid entity-relationship diagrams when the user requests an ERD, database data model, schema design, or architecture diagram.
---

# ERD Generator

Generate a Mermaid Entity-Relationship Diagram from the user's domain requirements and validate it using the local renderer script.

## Workflow

1. Parse the domain requirements and identify:
   - Entities
   - Attributes
   - Primary keys (PK)
   - Foreign keys (FK)
   - Relationships
   - Cardinalities

2. Convert the requirements into valid Mermaid `erDiagram` syntax.

3. Write the Mermaid ERD directly to:

   `docs/architecture/schema.mmd`

4. Execute the validation and rendering script:

   `node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd`

5. If the command fails and returns `SYNTAX_ERROR`:
   - Read the error trace.
   - Correct the Mermaid syntax in `docs/architecture/schema.mmd`.
   - Run the renderer again.
   - Retry up to 3 times.

6. Do not report success unless the renderer exits successfully.

7. After successful validation:
   - Present the raw Mermaid code block to the user.
   - Tell the user that the rendered SVG is located at:

     `docs/architecture/erd.svg`

## ERD Rules

- Use Mermaid `erDiagram` syntax.
- Clearly mark primary keys with `PK`.
- Clearly mark foreign keys with `FK`.
- Use appropriate Mermaid relationship cardinalities.
- Preserve existing entities when the user says an entity or table already exists.
- Make reasonable business decisions when requirements are ambiguous and explain those decisions.