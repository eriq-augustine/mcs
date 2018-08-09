'use strict;'

var mcs = mcs || {};

function addBox() {
   mcs.boxes = mcs.boxes || []

   var id = mcs.boxes.length;

   var box = document.createElement('input');
   box.className = 'box';
   box.setAttribute('type', 'text');
   box.setAttribute('data-id', id);
   box.setAttribute('data-name', '');
   box.setAttribute('onClick', 'selectBox(' + id + ');');

   mcs.boxes.push(box);
   $('.page-pane').append(box);
}

function selectBox(id) {
   if (mcs.selected == id) {
      return;
   }
   mcs.selected = id;

   $('.box').removeClass('selected');
   $('.box[data-id=' + id + ']').addClass('selected');

   fillBoxContext(id);
}

function fillBoxContext(id) {
   $('.context-pane').empty();
   addBoxContextButtons(id);

   var box = $('.box[data-id=' + id + ']');

   var wrapElement = function(labelText, field, prefix = '') {
      var label = document.createElement('label');
      label.innerHTML = labelText + ': ' + prefix;

      var wrap = document.createElement('div');
      wrap.className = 'context-wrap';

      wrap.appendChild(label);
      wrap.appendChild(field);

      return wrap;
   };

   var idField = document.createElement('span');
   idField.innerHTML = '$' + id;
   $('.context-pane').append(wrapElement('ID', idField));

   var nameField = document.createElement('input');
   nameField.value = box.attr('data-name');
   nameField.className = 'context-name';
   nameField.setAttribute('type', 'text');
   nameField.setAttribute('data-id', id);
   $('.context-pane').append(wrapElement('Name', nameField, '#'));
}

function addBoxContextButtons(id) {
   var buttonArea = document.createElement('div');
   buttonArea.className = 'context-buttons';

   var saveButton = document.createElement('button');
   saveButton.innerHTML = 'Save';
   saveButton.setAttribute('onClick', 'saveBox(' + id + ');');
   buttonArea.appendChild(saveButton);

   var clearButton = document.createElement('button');
   clearButton.innerHTML = 'Load';
   clearButton.setAttribute('onClick', 'clearBox(' + id + ');');
   buttonArea.appendChild(clearButton);

   $('.context-pane').append(buttonArea);
}

function saveBox(id) {
   // TODO(eriq)
   console.log("Save Box: " + id);


   var name = $('.context-pane .context-name').val();
   $('.box[data-id=' + id + ']').attr('data-name', name);
}

function loadBox(id) {
   // TODO(eriq)
   console.log("Load Box: " + id);
}

function load() {
   // TODO(eriq)
   console.log("Load");
}

function download() {
   // TODO(eriq)
   console.log("Download");
}

function viewMode() {
   // TODO(eriq)
   console.log("View Mode");
}

