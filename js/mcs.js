'use strict;'

var mcs = mcs || {};

$(document).ready(function() {
   document.getElementById('background-upload').addEventListener('change', handleFileSelect, false);
});

function clickUpload() {
   $('#background-upload').click();
}

function handleFileSelect() {
   var files = document.getElementById('background-upload').files;

   if (files.length == 0) {
      return;
   }

   // TODO(eriq): Handle multiple files.
   if (files.length > 1) {
      return;
   }

   var file = files[0];

   var reader = new FileReader();
   reader.onload = function(event) {
      $('.background-image').show().attr('src', event.target.result);
   };

   reader.readAsDataURL(file);
}

function addBox() {
   mcs.boxes = mcs.boxes || []

   var id = mcs.boxes.length;

   var box = document.createElement('input');
   box.className = 'box';
   box.setAttribute('type', 'text');
   box.setAttribute('data-id', id);
   box.setAttribute('data-name', '');
   box.setAttribute('data-value', '');
   box.setAttribute('readonly', true);
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

   var valueField = document.createElement('input');
   valueField.value = box.attr('data-value');
   valueField.className = 'context-value';
   valueField.setAttribute('type', 'text');
   valueField.setAttribute('data-id', id);
   $('.context-pane').append(wrapElement('Value', valueField));
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

   var value = $('.context-pane .context-value').val();
   $('.box[data-id=' + id + ']').attr('data-value', value);
   $('.box[data-id=' + id + ']').val(value);
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

