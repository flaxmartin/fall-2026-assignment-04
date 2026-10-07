import fs from 'fs';
import path from 'path';

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('ERROR: No Mermaid ERD file provided.');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`ERROR: File not found: ${inputFile}`);
  process.exit(1);
}

const mermaid = fs.readFileSync(inputFile, 'utf8');

const entityRegex = /(\w+)\s*\{([\s\S]*?)\}/g;

const entities = [];
let match;

while ((match = entityRegex.exec(mermaid)) !== null) {
  const tableName = match[1].toLowerCase();
  const body = match[2];

  const columns = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);

      return {
        type: parts[0],
        name: parts[1],
        primaryKey: parts.includes('PK'),
      };
    });

  entities.push({
    tableName,
    columns,
  });
}

if (entities.length === 0) {
  console.error('ERROR: No entities found in Mermaid ERD.');
  process.exit(1);
}

function getColumnType(column) {
  if (column.primaryKey && column.type === 'int') {
    return `'serial'`;
  }

  switch (column.type) {
    case 'int':
      return `'integer'`;
    case 'string':
      return `'varchar(255)'`;
    case 'timestamp':
      return `'timestamp'`;
    default:
      throw new Error(`Unsupported Mermaid type: ${column.type}`);
  }
}

let upCode = '';
let downCode = '';

for (const entity of entities.filter((entity) => entity.tableName !== 'users')) {
  upCode += `  await db.schema\n`;
  upCode += `    .createTable('${entity.tableName}')\n`;

  for (const column of entity.columns) {
    let callback = '';

    if (column.primaryKey) {
      callback = `, (col) => col.primaryKey()`;
    }

    upCode += `    .addColumn('${column.name}', ${getColumnType(column)}${callback})\n`;
  }

  upCode += `    .execute();\n\n`;
}
for (const entity of [...entities].filter((entity) => entity.tableName !== 'users').reverse()) {
  downCode += `  await db.schema.dropTable('${entity.tableName}').execute();\n`;
}

const migration = `import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
${upCode.trimEnd()}
}

export async function down(db: Kysely<any>): Promise<void> {
${downCode.trimEnd()}
}
`;

const migrationsDirectory = path.join(
  process.cwd(),
  'src',
  'db',
  'migrations'
);

fs.mkdirSync(migrationsDirectory, { recursive: true });

const existingMigrations = fs
  .readdirSync(migrationsDirectory)
  .filter((file) => /^\d+_.*\.ts$/.test(file));

let highestNumber = 0;

for (const file of existingMigrations) {
  const number = Number.parseInt(file.split('_')[0], 10);

  if (number > highestNumber) {
    highestNumber = number;
  }
}

const nextNumber = String(highestNumber + 1).padStart(3, '0');

const outputFile = path.join(
  migrationsDirectory,
  `${nextNumber}_generated_from_erd.ts`
);

if (fs.existsSync(outputFile)) {
  console.error(`ERROR: Migration already exists: ${outputFile}`);
  process.exit(1);
}

fs.writeFileSync(outputFile, migration);

console.log(`SUCCESS: ${outputFile}`);