import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const jsonFileRootDir = join(tmpdir(), 'snyk_json');