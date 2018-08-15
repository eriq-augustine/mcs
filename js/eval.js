'use strict';

var mcs = mcs || {};
mcs.eval = mcs.eval || {};

// TODO(eriq): Tighten up the boundaries.
mcs.eval.IDS_REGEX = /\$\d+/g;
mcs.eval.NAMES_REGEX = /#\w+/g;

// We deal with cell side effects by applying the effect directly to the target.
// The effect author is responsible for making sure the target is used in the effect if it is meant to be an update.
// If the target is used in the side effect, then the value before application of the side effect is just used.
// No order is guarenteed.
// Cells with side effects on them are always evaluated.

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

         let evaluation = evalInfo.value;
         if (evalInfo.evaluate) {
            evaluation = mcs.eval.evaluateExpression(evalInfo.value, resolvedCells);
         }

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
   let sideEffects = mcs.eval.gatherSideEffects(cells, nameToId);

   let evalInfos = new Map();

   for (let cell of cells.values()) {
      let value = cell.value;
      let dependencies = new Set();
      let evaluate = false;

      if (cell.evaluate || sideEffects.has(cell.id)) {
         evaluate = true;

         // First replace names with ids.
         value = mcs.eval.subNames(value, nameToId);

         // Apply side effects.
         value = mcs.eval.applySideEffects(cell.id, value, sideEffects);

         // Find all the dependencies.
         let ids = value.match(mcs.eval.IDS_REGEX);
         if (ids) {
            for (let id of ids) {
               dependencies.add(parseInt(id.substr(1), 10));
            }
         }
      }

      evalInfos.set(cell.id, {
         value: value,
         dependencies: dependencies,
         evaluate: evaluate
      });
   }

   return evalInfos;
}

mcs.eval.applySideEffects = function(id, value, sideEffects) {
   if (!sideEffects.has(id)) {
      return value;
   }

   for (let sideEffect of sideEffects.get(id)) {
      let oldValue = value;
      // TODO(eriq): More strict on word boundaries.
      value = sideEffect.replace(new RegExp(`\\$${id}`, 'g'), oldValue);
   }

   return value;
}

// Sub out names for identifiers.
mcs.eval.subNames = function(value, nameToId) {
   let namesToReplace = value.match(mcs.eval.NAMES_REGEX);
   if (namesToReplace) {
      for (let nameToReplace of value.match(mcs.eval.NAMES_REGEX)) {
         value = value.replace(nameToReplace, '$' + nameToId.get(nameToReplace.substr(1)));
      }
   }

   return value;
}

// Gather all the side effects, replace names, and map to their target.
// Return: {targetId: [sideEffect, ...], ...}
mcs.eval.gatherSideEffects = function(cells, nameToId) {
   let allSideEffects = new Map();

   for (let cell of cells.values()) {
      if (cell.sideEffects.length == 0) {
         continue;
      }

      for (let sideEffect of cell.sideEffects) {
         let target = parseInt(mcs.eval.subNames(sideEffect.target, nameToId).substr(1), 10);
         var effect = mcs.eval.subNames(sideEffect.effect, nameToId);

         if (!allSideEffects.has(target)) {
            allSideEffects.set(target, []);
         }

         allSideEffects.get(target).push(effect);
      }
   }

   return allSideEffects;
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
