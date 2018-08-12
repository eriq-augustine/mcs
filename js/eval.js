'use strict';

var mcs = mcs || {};
mcs.eval = mcs.eval || {};

// TODO(eriq): Tighten up the boundaries.
mcs.eval.IDS_REGEX = /\$\d+/g;
mcs.eval.NAMES_REGEX = /#\w+/g;

// Evaluate all the given cells and assign their values and return a map with their evaluations.
// |cells| should be a map of id => cell.
// Return: {id => evaluation, ...}.
mcs.eval.evaluateCells = function(cells) {
   // The right way to do this would be to build a dependency graph, check for cycles, topo sort, and then eval in sorted order.
   // However, we expect to see a relatively small number of nodes with simple dependencies.
   // So, instead we will just iteratively eval until either we are done or we cannot resolve anything (a cycle exists).

   // Get information about each value.
   let evalInfos = mcs.eval.buildEvalInfo(cells);

   let resolvedCells = new Map();

   while (resolvedCells.size != cells.size) {
      let resolved = false;

      for (let [id, evalInfo] of evalInfos.entries()) {
         // Skip already resolved entries.
         if (resolvedCells.has(id)) {
            continue;
         }

         // Check if dependencies are satisfied.
         if (!mcs.util.setContains(resolvedCells, ...evalInfo.dependencies)) {
            continue;
         }

         let evaluation = mcs.eval.evaluateExpression(evalInfo.value, resolvedCells);
         resolvedCells.set(id, evaluation);
         resolved = true;
      }

      if (!resolved) {
         // Cycle!
         let cycleCells = [];

         for (let cell of cells.values()) {
            if (resolvedCells.has(cell.id)) {
               continue;
            }

            cycleCells.push(`\$${cell.id} (#${cell.name})`);
         }

         throw `Cycle detected! Check these cells for a cycle: [${cycleCells.join(', ')}].`
      }
   }

   return resolvedCells;
}

// Return: {id => {value, dependencies}}.
mcs.eval.buildEvalInfo = function(cells) {
   let nameToId = mcs.eval.buildNameToIdMap(cells);

   let evalInfos = new Map();

   for (let cell of cells.values()) {
      let value = cell.value;
      let dependencies = new Set();

      // First replace names with ids.
      let namesToReplace = value.match(mcs.eval.NAMES_REGEX);
      if (namesToReplace) {
         for (let nameToReplace of value.match(mcs.eval.NAMES_REGEX)) {
            value = value.replace(nameToReplace, '$' + nameToId.get(nameToReplace.substr(1)));
         }
      }

      let ids = value.match(mcs.eval.IDS_REGEX);
      if (ids) {
         for (let id of ids) {
            dependencies.add(parseInt(id.substr(1), 10));
         }
      }

      evalInfos.set(cell.id, {
         value: value,
         dependencies: dependencies
      });
   }

   return evalInfos;
}

mcs.eval.buildNameToIdMap = function(cells) {
   let nameToId = new Map();

   for (let cell of cells.values()) {
      if (!mcs.util.nil(cell.name) && cell.name != '') {
         nameToId.set(cell.name, cell.id);
      }
   }

   return nameToId;
}

mcs.eval.evaluateExpression = function(value, resolvedCells) {
   // Extra strict because we actually use eval().
   'use strict';

   let idsToReplace = value.match(mcs.eval.IDS_REGEX);
   if (idsToReplace) {
      for (let idToReplace of idsToReplace) {
         let cleanId = parseInt(idToReplace.substr(1), 10);
         value = value.replace(idToReplace, resolvedCells.get(cleanId));
      }
   }

   return eval(value);
}
