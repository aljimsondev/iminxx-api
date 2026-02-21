// setup.ts
import { execSync } from 'child_process';

execSync('node dist/script/setup-definitions.js', { stdio: 'inherit' });
execSync('node dist/script/load-entries.js', { stdio: 'inherit' });
