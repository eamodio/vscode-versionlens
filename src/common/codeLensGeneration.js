/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range, Uri } from 'vscode';
import { PackageCodeLens } from './packageCodeLens';

export function generateCodeLenses(packageCollection, document) {
  const documentUrl = Uri.file(document.fileName);
  return Promise.all(packageCollection)
    .then(results => {
      const codeLenses = [];
      results.forEach(entryOrEntries => {
        if (entryOrEntries === undefined)
          return;

        if (Array.isArray(entryOrEntries)) {
          entryOrEntries.forEach(
            (entry, order) => {
              entry.package.order = order;
              codeLenses.push(createCodeLensFromEntry(entry, document, documentUrl));
            }
          );
          return;
        }

        codeLenses.push(
          createCodeLensFromEntry(
            {
              node: entryOrEntries.node,
              package: createPackageFromNode(entryOrEntries.node)
            },
            document,
            documentUrl
          )
        );

      });

      return codeLenses;
    });
}

function createPackageFromNode(node) {
  return {
    name: node.name,
    version: node.replaceInfo.value || node.value,
    meta: {
      tag: { name: 'latest', version: 'latest' },
      isValidSemver: null
    },
    order: 0
  };
}

function createCodeLensFromEntry(entry, document, documentUrl) {
  const commandRange = new Range(
    document.positionAt(entry.node.start + entry.package.order),
    document.positionAt(entry.node.end)
  );
  const replaceRange = new Range(
    document.positionAt(entry.node.replaceInfo.start),
    document.positionAt(entry.node.replaceInfo.end)
  );
  return new PackageCodeLens(
    commandRange,
    replaceRange,
    entry.package,
    documentUrl
  );
}