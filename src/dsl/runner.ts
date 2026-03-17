import ts from 'typescript';
import vm from 'vm';
import fs from 'fs';
import path from 'path';
import type { PageSpec } from '../types';

/** Max execution time for a DSL file (ms) */
const DSL_TIMEOUT = 5000;

/** Resolve the path to the DSL type declarations (dist/dsl/index.d.ts) */
function getDslTypesPath(): string {
  return path.resolve(__dirname, 'index.d.ts');
}

/**
 * Type-check a DSL file using ts.createProgram.
 * Returns an array of formatted diagnostic messages, empty if clean.
 */
function typeCheck(absPath: string): string[] {
  const dslTypesPath = getDslTypesPath();

  const program = ts.createProgram([absPath], {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
    strict: true,
    noEmit: true,
    paths: { 'claw2ui/dsl': [dslTypesPath] },
    baseUrl: path.dirname(absPath),
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length === 0) return [];

  return diagnostics.map(d => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    if (d.file && d.start !== undefined) {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
      return `${path.basename(d.file.fileName)}:${line + 1}:${character + 1} - ${msg}`;
    }
    return msg;
  });
}

export interface RunDslOptions {
  /** Skip type checking (default: false) */
  noCheck?: boolean;
}

export function runDslFile(filePath: string, opts?: RunDslOptions): PageSpec {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  // Type-check unless --no-check is set
  if (!opts?.noCheck) {
    const errors = typeCheck(absPath);
    if (errors.length > 0) {
      throw new Error(
        `Type errors in ${path.basename(absPath)}:\n  ${errors.join('\n  ')}`,
      );
    }
  }

  const source = fs.readFileSync(absPath, 'utf-8');

  // Transpile TS → JS (single-file, no type-checking, fast)
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      strict: false,
    },
    fileName: path.basename(absPath),
  });

  // Restricted require: only "claw2ui/dsl" is allowed.
  const dslModule = require('./index');

  const customRequire = (id: string) => {
    if (id === 'claw2ui/dsl') return dslModule;
    throw new Error(
      `DSL files can only import "claw2ui/dsl". Blocked: "${id}"`,
    );
  };

  // Execute in an isolated VM context with a timeout.
  //
  // Security layers:
  //   1. vm.createContext() — isolates globals (no process, global, require)
  //   2. Restricted require — only "claw2ui/dsl" is importable
  //   3. Sandbox-native require wrapper — require.constructor stays in sandbox
  //   4. Timeout — prevents infinite loops from hanging the CLI
  //
  // Known limitation: DSL functions (page, stat, etc.) are host functions
  // whose .constructor can reach the main-context Function. Node's vm module
  // is documented as not being a security mechanism. For fully untrusted code,
  // worker_threads or child_process isolation would be needed.
  const sandbox: any = vm.createContext(Object.create(null));
  sandbox.__require = customRequire;

  const fullScript = `
(function(__req) {
  delete this.__require;
  var require = function(id) { return __req(id); };
  var module = { exports: {} };
  var exports = module.exports;
  var __filename = ${JSON.stringify(absPath)};
  var __dirname = ${JSON.stringify(path.dirname(absPath))};
  ${outputText}
  return module.exports;
}).call(this, this.__require)
`;

  const script = new vm.Script(fullScript, { filename: absPath });
  let modExports: any;
  try {
    modExports = script.runInContext(sandbox, { timeout: DSL_TIMEOUT });
  } catch (err: any) {
    if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
      throw new Error(`DSL execution timed out after ${DSL_TIMEOUT}ms`);
    }
    throw err;
  }

  // Marshal result through JSON to cross the VM context boundary cleanly.
  const raw = modExports.__esModule ? modExports.default : modExports;
  let result: any;
  try {
    result = JSON.parse(JSON.stringify(raw));
  } catch {
    throw new Error('DSL file must export a JSON-serializable PageSpec');
  }

  if (!result || !Array.isArray(result.components)) {
    throw new Error(
      'DSL file must export a PageSpec. Use: export default page("Title", [...])',
    );
  }

  return result as PageSpec;
}
