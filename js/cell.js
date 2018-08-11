'use strict';

var mcs = mcs || {};
mcs.cell = mcs.cell || {};

mcs.cell.DEFAULT_CELL_WIDTH = 50;
mcs.cell.DEFAULT_CELL_HEIGHT = 50;

mcs.cell.Cell = class {
   constructor({id, page = 0, name = '', value = '', locked = false,
         width = mcs.cell.DEFAULT_CELL_WIDTH, height = mcs.cell.DEFAULT_CELL_HEIGHT, x = 0, y = 0}) {
      if (mcs.util.nil(id)) {
         throw "Cell id must be real.";
      }

      this.id = id;
      this.page = page;

      this.name = name;
      this.value = value;
      this.locked = locked;
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
   };

   getSelector() {
      return mcs.cell.selector(this.id);
   };

   // Get a div that represents this cell.
   // For use on the sheet itself (not context panel).
   getDiv() {
      let div = document.createElement('div');
      div.className = 'cell';

      div.setAttribute('data-id', this.id);

      div.style.width = this.width;
      div.style.height = this.height;

      div.style.webkitTransform = 'translate(' + this.x + 'px,' + this.y + 'px)';
      div.style.transform = 'translate(' + this.x + 'px,' + this.y + 'px)';

      div.setAttribute('onClick', 'selectCell(' + this.id + ');');

      return div;
   };

   // Not an actual form, but just a bunch of fields that represent this cell.
   // Return: [{labelText, field, prefix}, ...]
   getDetailsForm() {
      let form = [];

      let idField = document.createElement('span');
      idField.innerHTML = '$' + this.id;
      form.push({labelText: 'ID', field: idField});

      var nameField = document.createElement('input');
      nameField.className = 'context-name';
      nameField.setAttribute('type', 'text');
      nameField.value = this.name;
      nameField.setAttribute('data-id', this.id);
      form.push({labelText: 'Name', field: nameField, prefix: '#'});

      var valueField = document.createElement('input');
      valueField.className = 'context-value';
      valueField.setAttribute('type', 'text');
      valueField.value = this.value;
      valueField.setAttribute('data-id', this.id);
      form.push({labelText: 'Value', field: valueField});

      var lockedField = document.createElement('input');
      lockedField.className = 'context-locked';
      lockedField.setAttribute('type', 'checkbox');
      lockedField.checked = this.locked;
      lockedField.setAttribute('data-id', this.id);
      form.push({labelText: 'Locked', field: lockedField});

      return form;
   };
};

mcs.cell.selector = function(id) {
   return '.cell[data-id="' + id + '"]';
}
