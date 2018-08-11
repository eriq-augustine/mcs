'use strict';

var mcs = mcs || {};
mcs.cell = mcs.cell || {};

mcs.cell.DEFAULT_CELL_WIDTH = 50;
mcs.cell.DEFAULT_CELL_HEIGHT = 50;

// Transform into a simple object.
mcs.cell.toObject = function(cell) {
   return {
      id: cell.getAttribute('data-id'),
      name: cell.getAttribute('data-name'),
      value: cell.getAttribute('data-value'),
      locked: cell.getAttribute('data-locked') || false,
      x: cell.getAttribute('data-x') || 0,
      y: cell.getAttribute('data-y') || 0,
      width: cell.style.width,
      height: cell.style.height,
   };
}

// Transform from a simple object.
mcs.cell.fromObject = function(rawCell) {
   return mcs.cell.create(
         rawCell.id,
         rawCell.name, rawCell.value, rawCell.locked,
         rawCell.width, rawCell.height, rawCell.x, rawCell.y);
}

mcs.cell.selector = function(id) {
   return '.cell[data-id="' + id + '"]';
}

mcs.cell.create = function(id, name, value, locked, width, height, x, y) {
   name = mcs.util.defaultNil(name, '');
   value = mcs.util.defaultNil(value, '');
   locked = mcs.util.defaultNil(locked, false);
   width = mcs.util.defaultNil(width, mcs.cell.DEFAULT_CELL_WIDTH);
   height = mcs.util.defaultNil(height, mcs.cell.DEFAULT_CELL_HEIGHT);
   x = mcs.util.defaultNil(x, 0);
   y = mcs.util.defaultNil(y, 0);

   var cell = document.createElement('div');
   cell.className = 'cell';
   cell.setAttribute('data-id', id);
   cell.setAttribute('data-name', name);
   cell.setAttribute('data-value', value);
   cell.setAttribute('data-locked', locked);

   cell.style.width = width;
   cell.style.height = height;

   cell.setAttribute('data-x', x);
   cell.setAttribute('data-y', y);
   cell.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
   cell.style.transform = 'translate(' + x + 'px,' + y + 'px)';

   cell.setAttribute('onClick', 'selectCell(' + id + ');');

   return cell;
}
