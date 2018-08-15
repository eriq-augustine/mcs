'use strict';

var mcs = mcs || {};
mcs.cell = mcs.cell || {};

mcs.cell.DEFAULT_CELL_WIDTH = 50;
mcs.cell.DEFAULT_CELL_HEIGHT = 50;

mcs.cell.Cell = class {
   constructor({id, page = 0, name = '', value = '', sideEffects = [],
         locked = false, evaluate = false,
         width = mcs.cell.DEFAULT_CELL_WIDTH, height = mcs.cell.DEFAULT_CELL_HEIGHT, x = 0, y = 0}) {
      if (mcs.util.nil(id)) {
         throw "Cell id must be real.";
      }

      this.id = id;
      this.page = page;

      this.name = name;
      this.value = value;
      this.sideEffects = sideEffects;

      this.locked = locked;
      this.evaluate = evaluate;
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
   };

   getSelector() {
      return mcs.cell.selector(this.id);
   };

   // Get an element that represents this cell in edit mode.
   // For use on the sheet itself (not context panel).
   getEditElement() {
      let element = document.createElement('div');
      element.innerHTML = this.value;
      element.setAttribute('onClick', 'selectCell(' + this.id + ');');

      return this._getElementInternal(element);
   };

   // Get an element that represents this cell in view mode.
   // For use on the sheet itself (not context panel).
   // Set all display values as defaults, real values will be populated after evaluation.
   getViewElement() {
      let element = document.createElement('input');
      element.setAttribute('type', 'text');
      element.value = '?';

      if (this.locked) {
         element.disabled = true;
      } else {
         let inputFunction = function(event) {
            this.value = event.target.value;
         }

         // Make the cell |this| instead of the div.
         element.oninput = inputFunction.bind(this);
      }

      return this._getElementInternal(element);
   };

   _getElementInternal(baseElement) {
      baseElement.className = 'cell';

      baseElement.setAttribute('data-id', this.id);

      baseElement.style.width = this.width;
      baseElement.style.height = this.height;

      baseElement.style.lineHeight = this.height;

      baseElement.style.webkitTransform = 'translate(' + this.x + 'px,' + this.y + 'px)';
      baseElement.style.transform = 'translate(' + this.x + 'px,' + this.y + 'px)';

      return baseElement;
   }

   // Not an actual form, but just a bunch of fields that represent this cell.
   // Return: [{labelText, field, prefix}, ...]
   getDetailsForm() {
      let form = [];

      let idField = document.createElement('span');
      idField.innerHTML = '$' + this.id;
      form.push({labelText: `ID: \$${this.id}`})

      var nameField = document.createElement('input');
      nameField.className = 'context-name';
      nameField.setAttribute('type', 'text');
      nameField.value = this.name;
      nameField.setAttribute('data-id', this.id);
      nameField.oninput = function(event) {
         // TODO(eriq): Validate name conflicts.
         this.name = event.target.value;
      }.bind(this);
      form.push({labelText: 'Name', field: nameField, prefix: '#'});

      var valueField = document.createElement('input');
      valueField.className = 'context-value';
      valueField.setAttribute('type', 'text');
      valueField.value = this.value;
      valueField.setAttribute('data-id', this.id);
      valueField.oninput = function(event) {
         this.value = event.target.value;

         // If there is a div out there, update it.
         $(this.getSelector()).html(this.value);
      }.bind(this);
      form.push({labelText: 'Value', field: valueField});

      var lockedField = document.createElement('input');
      lockedField.className = 'context-locked';
      lockedField.setAttribute('type', 'checkbox');
      lockedField.checked = this.locked;
      lockedField.setAttribute('data-id', this.id);
      lockedField.oninput = function(event) {
         this.locked = event.target.checked;
      }.bind(this);
      form.push({labelText: 'Locked', field: lockedField});

      var evaluateField = document.createElement('input');
      evaluateField.className = 'context-evaluate';
      evaluateField.setAttribute('type', 'checkbox');
      evaluateField.checked = this.evaluate;
      evaluateField.setAttribute('data-id', this.id);
      evaluateField.oninput = function(event) {
         this.evaluate = event.target.checked;
      }.bind(this);
      form.push({labelText: 'Evaluate', field: evaluateField});

      // TODO(eriq): Make a real UI for this instead of using JSON.
      var sideEffectsField = document.createElement('input');
      sideEffectsField.className = 'context-sideeffects';
      sideEffectsField.setAttribute('type', 'text');
      sideEffectsField.value = JSON.stringify(this.sideEffects);
      sideEffectsField.setAttribute('data-id', this.id);
      sideEffectsField.oninput = function(event) {
         // TODO(eriq): Validate.
         try {
            this.sideEffects = JSON.parse(event.target.value);
         } catch (error) {
            // Ignore for now.
            // Just don't save, the user may have not finished typing.
         }
      }.bind(this);
      form.push({labelText: 'Side Effects', field: sideEffectsField});

      return form;
   };
};

mcs.cell.selector = function(id) {
   return '.cell[data-id="' + id + '"]';
}
