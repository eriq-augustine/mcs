'use strict';

var mcs = mcs || {};
mcs.main = mcs.main || {};

// TODO(eriq): Custom filenames.
mcs.main.FILENAME = 'character_sheet.mcs'

// All the cells on the sheet.
// Keeping it as a map makes JSON operations harder, but is more robust in the end.
mcs.main.cells = mcs.main.cells || new Map();

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
   let dump = {
      pages: [
         {
            background: $('.background-image').attr('src'),
         }
      ],
      cells: [...mcs.main.cells]
   };

   return JSON.stringify(dump, null, 4);
}

function deserialize(text) {
   var data = JSON.parse(text);

   // TODO(eriq): Clear existing.
   // TODO(eriq): Multiple pages.

   let page = data.pages[0];

   if (page.background) {
      $('.background-image').show().attr('src', page.background);
   }

   let cells = new Map(data.cells);
   for (let rawCell of cells.values()) {
      let cell = new mcs.cell.Cell(rawCell);
      addCell(cell);
   }
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

// Add a cell to the page.
function addCell(cell) {
   let id;
   if (mcs.util.nil(cell)) {
      id = mcs.main.cells.size;
      cell = new mcs.cell.Cell({id: id});
   } else {
      id = cell.id;
   }

   mcs.main.cells.set(id, cell);
   $('.page-pane').append(cell.getDiv());

   mcs.util.makeDragable(cell);
}


function selectCell(id) {
   if (mcs.main.selected === id) {
      return;
   }
   mcs.main.selected = id;

   $('.cell').removeClass('selected');
   $(mcs.cell.selector(id)).addClass('selected');

   let cell = mcs.main.cells.get(id);
   fillCellContext(cell);
}

function fillCellContext(cell) {
   $('.context-pane').empty();
   addCellContextButtons(cell);

   cell.getDetailsForm().forEach(function({labelText, field, prefix = ''}) {
      let label = document.createElement('label');
      label.innerHTML = labelText + ': ' + prefix;

      let wrap = document.createElement('div');
      wrap.className = 'context-wrap';

      wrap.appendChild(label);
      wrap.appendChild(field);

      $('.context-pane').append(wrap);
   });
}

function addCellContextButtons(cell) {
   var buttonArea = document.createElement('div');
   buttonArea.className = 'context-buttons';

   var saveButton = document.createElement('button');
   saveButton.innerHTML = 'Save';
   saveButton.setAttribute('onClick', 'saveCell(' + cell.id + ');');
   buttonArea.appendChild(saveButton);

   var clearButton = document.createElement('button');
   clearButton.innerHTML = 'Clear';
   clearButton.setAttribute('onClick', 'clearCell(' + cell.id + ');');
   buttonArea.appendChild(clearButton);

   $('.context-pane').append(buttonArea);
}

function saveCell(id) {
   // TODO(eriq): Validate. eg. name conflict.

   let cell = mcs.main.cells.get(id);

   cell.name = $('.context-pane .context-name').val();
   cell.value = $('.context-pane .context-value').val();
   cell.locked = $('.context-pane .context-locked').prop('checked');

   $(cell.getSelector()).html(cell.value);
}

function clearCell(id) {
   let cell = mcs.main.cells.get(id);

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
