'use strict';

var mcs = mcs || {};
mcs.util = mcs.util || {};

// Return |val| if it is not undefined or null, the default otherwise.
mcs.util.defaultNil = function(val, defaultVal) {
   if (val == undefined || val == null) {
      return defaultVal;
   }

   return val;
}

mcs.util.nil = function(val) {
   return val == undefined || val == null;
}

// Also works for a Map.
mcs.util.setContains = function(set, ...values) {
   for (let value of values) {
      if (!set.has(value)) {
         return false;
      }
   }

   return true;
}

mcs.util.makeUndragable = function(cell) {
   interact(cell.getSelector()).unset();
}

mcs.util.makeDragable = function(cell) {
   interact(cell.getSelector())
      .draggable({
         onmove: window.dragMoveListener,
         restrict: {
            restriction: 'parent',
            elementRect: {
               top: 0,
               left: 0,
               bottom: 1,
               right: 1
            }
         },
      })
      .resizable({
         // resize from all edges and corners
         edges: {
            left: true,
            right: true,
            bottom: true,
            top: true
         },

         // keep the edges inside the parent
         restrictEdges: {
            outer: 'parent',
            endOnly: true,
         },

         // minimum size
         restrictSize: {
            min: {
               width: 10,
               height: 10
            },
         },

         inertia: false,
      })
      .on('resizemove', function (event) {
         // The div that represents the context cell.
         var target = event.target;

         // update the element's style
         target.style.width = event.rect.width + 'px';
         target.style.height = event.rect.height + 'px';

         cell.width = target.style.width;
         cell.height = target.style.height;

         // Translate when resizing from top or left edges.
         cell.x += event.deltaRect.left;
         cell.y += event.deltaRect.top;

         target.style.webkitTransform = 'translate(' + cell.x + 'px,' + cell.y + 'px)';
         target.style.transform = 'translate(' + cell.x + 'px,' + cell.y + 'px)';
      })
      .on('dragmove', function(event) {
         // The div that represents the context cell.
         var target = event.target;

         cell.x += event.dx;
         cell.y += event.dy;

         target.style.webkitTransform = 'translate(' + cell.x + 'px,' + cell.y + 'px)';
         target.style.transform = 'translate(' + cell.x + 'px,' + cell.y + 'px)';
      });
}
