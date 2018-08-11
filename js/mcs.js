'use strict';

var mcs = mcs || {};
mcs.main = mcs.main || {};

// TODO(eriq): Custom filenames.
mcs.main.FILENAME = 'character_sheet.mcs'

// All the boxes on the sheet.
mcs.main.boxes = mcs.main.boxes || [];

$(document).ready(function() {
   document.getElementById('background-upload').addEventListener('change', handleBackgroundFileSelect, false);
   document.getElementById('sheet-load').addEventListener('change', handleSheetFileSelect, false);
});

function clickUploadBackground() {
   $('#background-upload').click();
}

function clickLoadSheet() {
   $('#sheet-load').click();
}

function serialize() {
   var dump = {
      pages: []
   };

   var page = {
      background: $('.background-image').attr('src'),
      boxes: []
   };

   mcs.main.boxes.forEach(function(box) {
      page.boxes.push(mcs.box.toObject(box));
   });

   dump.pages.push(page);

   return JSON.stringify(dump, null, 4);
}

function deserialize(text) {
   var data = JSON.parse(text);

   // TODO(eriq): Clear existing.
   // TODO(eriq): Multiple pages.

   var page = data.pages[0];

   $('.background-image').show().attr('src', page.background);

   page.boxes.forEach(function(rawBox) {
      var box = mcs.box.fromObject(rawBox);
      addBox(box);
   });
}

function handleSheetFileSelect() {
   var files = document.getElementById('sheet-load').files;

   if (files.length != 1) {
      console.error("Wrong number of files. Expected 1, got " + files.length + ".");
      return;
   }

   var file = files[0];

   var reader = new FileReader();
   reader.onload = function(event) {
      deserialize(event.target.result);
   };

   reader.readAsText(file);
}

function handleBackgroundFileSelect() {
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

// Add a new, empty box.
function addBox(box) {
   var id;
   if (mcs.util.nil(box)) {
      id = mcs.main.boxes.length;
      box = mcs.box.create(id);
   } else {
      id = box.getAttribute('data-id');
   }

   mcs.main.boxes.push(box);
   $('.page-pane').append(box);

   mcs.util.makeDragable(id);
}


function selectBox(id) {
   if (mcs.selected == id) {
      return;
   }
   mcs.selected = id;

   $('.box').removeClass('selected');
   $(mcs.box.selector(id)).addClass('selected');

   fillBoxContext(id);
}

function fillBoxContext(id) {
   $('.context-pane').empty();
   addBoxContextButtons(id);

   var box = $(mcs.box.selector(id));

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
   // TODO(eriq): Validate

   var name = $('.context-pane .context-name').val();
   $(mcs.box.selector(id)).attr('data-name', name);

   var value = $('.context-pane .context-value').val();
   $(mcs.box.selector(id)).attr('data-value', value);
   $(mcs.box.selector(id)).html(value);
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
   // TODO(eriq): Filename

   var data = serialize();

   var downloadLink = document.createElement('a');
   downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
   downloadLink.setAttribute('download', mcs.main.FILENAME);
   downloadLink.style.display = 'none';

   document.body.appendChild(downloadLink);
   downloadLink.click();
   document.body.removeChild(downloadLink);
}

function viewMode() {
   // TODO(eriq)
   console.log("View Mode");
}
