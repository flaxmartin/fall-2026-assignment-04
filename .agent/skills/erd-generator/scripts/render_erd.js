import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('SYNTAX_ERROR: No input Mermaid file provided.');
  process.exit(1);
}

const outputFile = path.join(
  path.dirname(inputFile),
  'erd.svg'
);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const args = [
  'mmdc',
  '-i',
  inputFile,
  '-o',
  outputFile
];

execFile('npx', args, (error, stdout, stderr) => {
  if (error) {
    console.error(`SYNTAX_ERROR: ${stderr || error.message}`);
    process.exit(1);
  }

  console.log('SUCCESS');
  process.exit(0);
});