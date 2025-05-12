export function parseScript(script: string, config: Record<string, string>) {
  return script.replace(/\${([^}]+)}/g, (_, key) => config[key] || '');
}
