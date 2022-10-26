import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { Context } from 'koa';
import type { RouterParamContext } from '@koa/router';
import semver from 'semver';
import { jsonFileRootDir } from '../config';

export default async (ctx: Context & RouterParamContext) => {
  try {
    const { pkg, version } = ctx.params;
    if (!pkg || !version) {
      throw new Error('Missing package name or version!');
    }

    if (!semver.valid(version)) {
      throw new Error(`Invalid version: ${version}, pkg: ${pkg}`);
    }

    const jsonFile = join(jsonFileRootDir, `${pkg}_${version}.json`);
    if (existsSync(jsonFile)) {
      ctx.body = getPackageVunerableData(require(jsonFile));
      return;
    }

    // query snyk api
    const data = await queryPackageVunerabilities(pkg, version, jsonFile);
    ctx.body = getPackageVunerableData(data);
  } catch (e) {
    ctx.status = 500;
    ctx.body = (e as Error).message;
  }
};

function getPackageVunerableData(json: Record<string, any>) {
  return {
    ok: json.ok,
    vulnerabilities: json?.vulnerabilities.map((v: Record<string, any>) => ({
      title: v.title,
      name: v.name,
      version: v.version,
      severity: v.severity,
      fixedIn: v.fixedIn,
      upgradePath: v.upgradePath,
    })),
  };
}

async function queryPackageVunerabilities(pkg: string, version: string, jsonFile: string): Promise<Record<string, any>> { 
  return await new Promise((resolve, reject) => {
    const cp = spawn('snyk', ['test', `${pkg}@${version}`, '--json', `--json-file-output=${jsonFile}`]);

    let result = '';
    cp.stdout.on('data', (data) => {
      result += data.toString();
    });

    cp.on('close', (code) => {
      try {
        const jsonResult = JSON.parse(result as string);
        resolve(jsonResult);
      } catch (e) {
        const err = new Error((e as Error).message);
        err.message = `exit code: ${code}, message: ${err.message}`;
        reject(err);
      }
    });
  });
}