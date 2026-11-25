export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  lineNumberOld?: number;
  lineNumberNew?: number;
  text: string;
}

/**
 * Compares two document versions line-by-line (Section 24.5 - Version Compare).
 */
export function compareDocumentVersions(oldText: string, newText: string): {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
  hasChanges: boolean;
} {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let addedCount = 0;
  let removedCount = 0;

  while (i < oldLines.length || j < newLines.length) {
    const oldLine = oldLines[i] ?? '';
    const newLine = newLines[j] ?? '';

    if (i < oldLines.length && j < newLines.length && oldLine === newLine) {
      result.push({
        type: 'unchanged',
        lineNumberOld: i + 1,
        lineNumberNew: j + 1,
        text: oldLine,
      });
      i++;
      j++;
    } else if (j < newLines.length && (i >= oldLines.length || !oldLines.slice(i).includes(newLine))) {
      result.push({
        type: 'added',
        lineNumberNew: j + 1,
        text: newLine,
      });
      addedCount++;
      j++;
    } else if (i < oldLines.length) {
      result.push({
        type: 'removed',
        lineNumberOld: i + 1,
        text: oldLine,
      });
      removedCount++;
      i++;
    }
  }

  return {
    lines: result,
    addedCount,
    removedCount,
    hasChanges: addedCount > 0 || removedCount > 0,
  };
}
