/**
 * Node handler for Source:File node.
 * Reads a file from the local filesystem and outputs its content as payload.
 */
export async function sourceFileHandler(node, pipeObj, _nodeType) {
    const filePath = (node.config?.['file_path'] ?? node.data?.config?.['file_path']);
    if (!filePath)
        throw new Error('Source:File — file_path config required');
    // Security: reject path traversal
    const normalizedPath = filePath.replace(/\\/g, '/');
    const windowsPathMatch = normalizedPath.match(/^([A-Z]:)[\\/]/);
    const drivePrefix = windowsPathMatch ? windowsPathMatch[1] : '';
    if (normalizedPath.includes('..') ||
        normalizedPath.startsWith('/etc') ||
        normalizedPath.startsWith('/proc') ||
        normalizedPath.startsWith('C:/etc') ||
        normalizedPath.startsWith('C:/proc') ||
        normalizedPath.match(/^[A-Z]:etc/) ||
        normalizedPath.match(/^[A-Z]:proc/)) {
        throw new Error(`Source:File — Path traversal not allowed: ${filePath}`);
    }
    const fs = await import('node:fs/promises');
    const pathModule = await import('node:path');
    const resolved = pathModule.resolve(normalizedPath);
    const content = await fs.readFile(resolved, 'utf-8');
    const stats = await fs.stat(resolved);
    return {
        filename: pathModule.basename(resolved),
        file_path: resolved,
        content,
        size: stats.size,
    };
}
