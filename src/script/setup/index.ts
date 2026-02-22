// setup.ts
import { execSync } from 'child_process';

execSync('node dist/script/setup/setup-definitions.js', { stdio: 'inherit' });
execSync('node dist/script/setup/load-entries.js', { stdio: 'inherit' });
