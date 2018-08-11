'use strict';

var mcs = mcs || {};
mcs.box = mcs.box || {};

mcs.box.DEFAULT_BOX_WIDTH = 50;
mcs.box.DEFAULT_BOX_HEIGHT = 50;

// Transform into a simple object.
mcs.box.toObject = function(box) {
   return {
      id: box.getAttribute('data-id'),
      name: box.getAttribute('data-name'),
      value: box.getAttribute('data-value'),
      x: box.getAttribute('data-x') || 0,
      y: box.getAttribute('data-y') || 0,
      width: box.style.width,
      height: box.style.height,
   };
}

// Transform from a simple object.
mcs.box.fromObject = function(rawBox) {
   return mcs.box.create(rawBox.id, rawBox.name, rawBox.value, rawBox.width, rawBox.height, rawBox.x, rawBox.y);
}

mcs.box.selector = function(id) {
   return '.box[data-id="' + id + '"]';
}

mcs.box.create = function(id, name, value, width, height, x, y) {
   name = mcs.util.defaultNil(name, '');
   value = mcs.util.defaultNil(value, '');
   width = mcs.util.defaultNil(width, mcs.box.DEFAULT_BOX_WIDTH);
   height = mcs.util.defaultNil(height, mcs.box.DEFAULT_BOX_HEIGHT);
   x = mcs.util.defaultNil(x, 0);
   y = mcs.util.defaultNil(y, 0);

   // TODO(eriq): Add locking behavior.

   var box = document.createElement('div');
   box.className = 'box';
   box.setAttribute('data-id', id);
   box.setAttribute('data-name', name);
   box.setAttribute('data-value', value);

   box.style.width = width;
   box.style.height = height;

   box.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
   box.style.transform = 'translate(' + x + 'px,' + y + 'px)';

   box.setAttribute('onClick', 'selectBox(' + id + ');');

   return box;
}
