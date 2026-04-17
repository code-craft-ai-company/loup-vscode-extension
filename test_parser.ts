import { Parser } from './packages/language-server/src/parser/parser';
import * as fs from 'fs';

const p = new Parser();
const text = fs.readFileSync(process.argv[2], 'utf8');
const result = p.parse(text);

if (result.diagnostics.length > 0) {
    console.log("ERRORS:", JSON.stringify(result.diagnostics, null, 2));
    process.exit(1);
} else {
    console.log("SUCCESS");
}
