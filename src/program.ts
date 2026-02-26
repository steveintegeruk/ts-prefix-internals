import ts from 'typescript';
import path from 'node:path';

export function createProgramFromConfig(tsconfigPath: string): ts.Program {
  const absolutePath = path.resolve(tsconfigPath);
  const configFile = ts.readConfigFile(absolutePath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(`Failed to read tsconfig: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`);
  }

  const basePath = path.dirname(absolutePath);
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, basePath);
  if (parsed.errors.length > 0) {
    const messages = parsed.errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    throw new Error(`tsconfig parse errors:\n${messages.join('\n')}`);
  }

  return ts.createProgram(parsed.fileNames, parsed.options);
}
