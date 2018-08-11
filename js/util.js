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

mcs.util.makeDragable = function(selector) {
   interact(selector)
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
               width: 20,
               height: 20
            },
         },

         inertia: false,
      })
      .on('resizemove', function (event) {
         var target = event.target;
         var x = (parseFloat(target.getAttribute('data-x')) || 0);
         var y = (parseFloat(target.getAttribute('data-y')) || 0);

         // update the element's style
         target.style.width = event.rect.width + 'px';
         target.style.height = event.rect.height + 'px';

         // translate when resizing from top or left edges
         x += event.deltaRect.left;
         y += event.deltaRect.top;

         target.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
         target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

         target.setAttribute('data-x', x);
         target.setAttribute('data-y', y);
      })
      .on('dragmove', function(event) {
         var target = event.target;
         var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
         var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

         target.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
         target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

         target.setAttribute('data-x', x);
         target.setAttribute('data-y', y);
      });
}
