'use strict';

var mcs = mcs || {};
mcs.main = mcs.main || {};

// TODO(eriq): Custom filenames.
mcs.main.FILENAME = 'character_sheet.mcs'

// All the cells on the sheet.
mcs.main.cells = mcs.main.cells || [];

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
      cells: []
   };

   mcs.main.cells.forEach(function(cell) {
      page.cells.push(mcs.cell.toObject(cell));
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

   page.cells.forEach(function(rawCell) {
      var cell = mcs.cell.fromObject(rawCell);
      addCell(cell);
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

// Add a new, empty cell.
function addCell(cell) {
   var id;
   if (mcs.util.nil(cell)) {
      id = mcs.main.cells.length;
      cell = mcs.cell.create(id);
   } else {
      id = cell.getAttribute('data-id');
   }

   mcs.main.cells.push(cell);
   $('.page-pane').append(cell);

   mcs.util.makeDragable(mcs.cell.selector(id));
}


function selectCell(id) {
   if (mcs.selected == id) {
      return;
   }
   mcs.selected = id;

   $('.cell').removeClass('selected');
   $(mcs.cell.selector(id)).addClass('selected');

   fillCellContext(id);
}

function fillCellContext(id) {
   $('.context-pane').empty();
   addCellContextButtons(id);

   var cell = $(mcs.cell.selector(id));

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
   nameField.setAttribute('type', 'text');
   nameField.value = cell.attr('data-name');
   nameField.className = 'context-name';
   nameField.setAttribute('data-id', id);
   $('.context-pane').append(wrapElement('Name', nameField, '#'));

   var valueField = document.createElement('input');
   valueField.setAttribute('type', 'text');
   valueField.value = cell.attr('data-value');
   valueField.className = 'context-value';
   valueField.setAttribute('data-id', id);
   $('.context-pane').append(wrapElement('Value', valueField));

   var lockedField = document.createElement('input');
   lockedField.setAttribute('type', 'checkcell');
   lockedField.checked = (cell.attr('data-locked') === 'true');
   lockedField.className = 'context-locked';
   lockedField.setAttribute('data-id', id);
   $('.context-pane').append(wrapElement('Locked', lockedField));
}

function addCellContextButtons(id) {
   var buttonArea = document.createElement('div');
   buttonArea.className = 'context-buttons';

   var saveButton = document.createElement('button');
   saveButton.innerHTML = 'Save';
   saveButton.setAttribute('onClick', 'saveCell(' + id + ');');
   buttonArea.appendChild(saveButton);

   var clearButton = document.createElement('button');
   clearButton.innerHTML = 'Clear';
   clearButton.setAttribute('onClick', 'clearCell(' + id + ');');
   buttonArea.appendChild(clearButton);

   $('.context-pane').append(buttonArea);
}

function saveCell(id) {
   // TODO(eriq): Validate

   var name = $('.context-pane .context-name').val();
   $(mcs.cell.selector(id)).attr('data-name', name);

   var value = $('.context-pane .context-value').val();
   $(mcs.cell.selector(id)).attr('data-value', value);
   $(mcs.cell.selector(id)).html(value);

   var locked = $('.context-pane .context-locked').prop('checked');
   $(mcs.cell.selector(id)).attr('data-locked', locked);
}

function clearCell(id) {
   // TODO(eriq)
   console.log("TODO(eriq): clearCell.");
}

function download() {
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
