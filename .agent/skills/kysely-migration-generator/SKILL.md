# Kysely Migration Generator

## Purpose

Generate a type-safe Kysely database migration from a Mermaid ERD stored in `docs/architecture/`.

## Workflow

1. Read the Mermaid ERD from `docs/architecture/schema.mmd`.
2. Identify all entities, columns, data types, primary keys, and relationships.
3. Convert the ERD into Kysely schema-builder code.
4. Generate the migration inside `src/db/migrations/`.
5. Use the existing migration style in the project as a reference.
6. Include both `up()` and `down()` functions.
7. The `up()` function must create the database objects.
8. The `down()` function must reverse the migration safely.
9. Use valid TypeScript and Kysely syntax.
10. Run the project build after generating the migration.
11. If validation fails, correct the generated migration and validate again.
12. Do not report success until the migration passes validation.

## Type Mapping

- Mermaid `int` -> Kysely `integer` or `serial` for generated primary keys
- Mermaid `string` -> Kysely `varchar(255)`
- Mermaid `timestamp` -> Kysely `timestamp`
- Primary keys must use `.primaryKey()`
- Required fields should use `.notNull()` when specified by the ERD.

## Output

Write the generated TypeScript migration to:

`src/db/migrations/`

Use a numbered migration filename that follows the existing project convention.

## Rules

- Do not modify existing migrations.
- Do not overwrite an existing migration.
- Preserve all entities and fields represented in the ERD.
- Generate deterministic, readable TypeScript.
- Follow the project's existing Kysely migration style.
- If the ERD is ambiguous, choose the safest reasonable mapping and clearly document the decision.