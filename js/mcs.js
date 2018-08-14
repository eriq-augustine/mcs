'use strict';

var mcs = mcs || {};
mcs.main = mcs.main || {};

// TODO(eriq): Custom filenames.
mcs.main.BASE_FILENAME = 'character_sheet'
mcs.main.FILENAME = mcs.main.BASE_FILENAME + '.mcs'

mcs.main.pages = mcs.main.pages || new Map();

// All the cells on the sheet.
// Keeping it as a map makes JSON operations harder, but is more robust in the end.
mcs.main.cells = mcs.main.cells || new Map();

mcs.main.selectedPage = mcs.main.selectedPage || null;
mcs.main.selectedCell = mcs.main.selectedCell || null;

$(document).ready(function() {
   document.getElementById('sheet-load').addEventListener('change', handleSheetFileSelect, false);
});

function clickUploadBackground(pageId) {
   $(`.background-upload-button-${pageId}`).click();
}

function clickLoadSheet() {
   $('#sheet-load').click();
}

function serialize() {
   let dump = {
      pages: [...mcs.main.pages],
      cells: [...mcs.main.cells]
   };

   return JSON.stringify(dump, null, 4);
}

function deserialize(text) {
   let data = JSON.parse(text);

   // TODO(eriq): Clear existing.

   let pages = new Map(data.pages);
   for (let rawPage of pages.values()) {
      addPage(rawPage);
   }

   let cells = new Map(data.cells);
   for (let rawCell of cells.values()) {
      let cell = new mcs.cell.Cell(rawCell);
      addCell(cell);
   }
}

function handleSheetFileSelect() {
   let files = document.getElementById('sheet-load').files;

   if (files.length != 1) {
      console.error("Wrong number of files. Expected 1, got " + files.length + ".");
      return;
   }

   let file = files[0];

   let reader = new FileReader();
   reader.onload = function(event) {
      deserialize(event.target.result);
   };

   reader.readAsText(file);
}

function handleBackgroundFileSelect(id) {
   let files = document.querySelector(`.background-upload-button-${id}`).files;

   if (files.length == 0) {
      return;
   }

   // TODO(eriq): Handle multiple files.
   if (files.length > 1) {
      return;
   }

   let file = files[0];

   let reader = new FileReader();
   reader.onload = function(event) {
      let background = event.target.result;

      mcs.main.pages.get(id).background = background;

      let backgroundElement = document.createElement('img');
      backgroundElement.className = 'background-image';
      backgroundElement.setAttribute('src', background);

      $(`.sheet-page-${id}`).append(backgroundElement);
   };

   reader.readAsDataURL(file);
}

function addPage({id = null, background = ''}) {
   if (mcs.util.nil(id)) {
      id = mcs.main.pages.size;
   }

   mcs.main.pages.set(id, {
      id: id,
      background: background
   });

   let newPage = document.createElement('div');
   newPage.className = `sheet-page sheet-page-${id}`;
   newPage.setAttribute('onClick', `selectPage(${id});`);

   $('.page-pane').append(newPage);

   if (mcs.util.defaultNil(background, '') != '') {
      let backgroundElement = document.createElement('img');
      backgroundElement.className = 'background-image';
      backgroundElement.setAttribute('src', background);

      $(`.sheet-page-${id}`).append(backgroundElement);
   }
}

function selectPage(pageId) {
   if (mcs.main.selectedPage === pageId) {
      return;
   }
   mcs.main.selectedPage = pageId;

   $('.sheet-page').removeClass('selected');
   $(`.sheet-page-${pageId}`).addClass('selected');

   fillPageContext(pageId);
}

function fillPageContext(pageId) {
   $('.page-context').empty();

   let pageHeader = document.createElement('h3');
   pageHeader.innerHTML = `Page: ${pageId}`;
   $('.page-context').append(pageHeader);

   let addCellButton = document.createElement('button');
   addCellButton.className = 'add-cell-button';
   addCellButton.innerHTML = 'Add Cell';
   addCellButton.setAttribute('onClick', `addCell(null, ${pageId});`);
   $('.page-context').append(addCellButton);

   let chooseBackgroundButton = document.createElement('button');
   chooseBackgroundButton.className = 'choose-background-button';
   chooseBackgroundButton.innerHTML = 'Choose Background';
   chooseBackgroundButton.setAttribute('onClick', `clickUploadBackground(${pageId})`);
   $('.page-context').append(chooseBackgroundButton);

   let chooseBackgroundInput = document.createElement('input');
   chooseBackgroundInput.className = `hidden-upload-button background-upload-button background-upload-button-${pageId}`;
   chooseBackgroundInput.setAttribute('type', 'file');
   chooseBackgroundInput.setAttribute('accept', 'image/*');
   chooseBackgroundInput.addEventListener('change', handleBackgroundFileSelect.bind(null, pageId), false);
   $('.page-context').append(chooseBackgroundInput);
}

// Add a cell to the page.
function addCell(cell, pageId) {
   let id;

   if (mcs.util.nil(cell)) {
      id = mcs.main.cells.size;
      cell = new mcs.cell.Cell({id: id, page: pageId});
   } else {
      id = cell.id;
      pageId = cell.page;
   }

   if (mcs.util.nil(pageId)) {
      throw "Tried to add a new cell without a page.";
   }

   mcs.main.cells.set(id, cell);
   $(`.page-pane .sheet-page-${pageId}`).append(cell.getEditElement());

   mcs.util.makeDragable(cell);
}

function selectCell(id) {
   if (mcs.main.selectedCell === id) {
      return;
   }
   mcs.main.selectedCell = id;

   $('.cell').removeClass('selected');
   $(mcs.cell.selector(id)).addClass('selected');

   let cell = mcs.main.cells.get(id);
   fillCellContext(cell);
}

function fillCellContext(cell) {
   $('.cell-context').empty();
   addCellContextButtons(cell);

   cell.getDetailsForm().forEach(function({labelText, field, prefix = ''}) {
      let label = document.createElement('label');
      label.innerHTML = labelText + ': ' + prefix;

      let wrap = document.createElement('div');
      wrap.className = 'context-wrap';

      wrap.appendChild(label);
      wrap.appendChild(field);

      $('.cell-context').append(wrap);
   });
}

function addCellContextButtons(cell) {
   let saveButton = document.createElement('button');
   saveButton.innerHTML = 'Save';
   saveButton.setAttribute('onClick', 'saveCell(' + cell.id + ');');
   $('.cell-context').append(saveButton);

   let clearButton = document.createElement('button');
   clearButton.innerHTML = 'Clear';
   clearButton.setAttribute('onClick', 'clearCell(' + cell.id + ');');
   $('.cell-context').append(clearButton);
}

function saveCell(id) {
   // TODO(eriq): Validate. eg. name conflict.

   let cell = mcs.main.cells.get(id);

   cell.name = $('.cell-context .context-name').val();
   cell.value = $('.cell-context .context-value').val();
   cell.locked = $('.cell-context .context-locked').prop('checked');
   cell.evaluate = $('.cell-context .context-evaluate').prop('checked');

   $(cell.getSelector()).html(cell.value);
}

function clearCell(id) {
   let cell = mcs.main.cells.get(id);

   // TODO(eriq)
   console.log("TODO(eriq): clearCell.");
}

function download() {
   let data = serialize();

   let downloadLink = document.createElement('a');
   downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
   downloadLink.setAttribute('download', mcs.main.FILENAME);
   downloadLink.style.display = 'none';

   document.body.appendChild(downloadLink);
   downloadLink.click();
   document.body.removeChild(downloadLink);
}

function viewMode() {
   $('.page').removeClass('edit-mode');
   $('.page').addClass('view-mode');

   // Replace all cells with display versions.
   $('.cell').remove();

   for (let cell of mcs.main.cells.values()) {
      $(`.page-pane .sheet-page-${cell.page}`).append(cell.getViewElement());
   }
}

function editMode() {
   $('.page').removeClass('view-mode');
   $('.page').addClass('edit-mode');

   // Replace all cells with edit versions.
   $('.cell').remove();

   for (let cell of mcs.main.cells.values()) {
      $(`.page-pane .sheet-page-${cell.page}`).append(cell.getEditElement());
      mcs.util.makeDragable(cell);
   }
}

function evalSheet() {
   let results = mcs.eval.evaluateCells(mcs.main.cells);

   // Fill the display cells with their evaluated values.
   for (let [id, result] of results.entries()) {
      $(mcs.main.cells.get(id).getSelector()).val(result).html(result);
   }
}

function print() {
   // First convert each sheet page to a Canvas.
   // Then get the data URL for the all the canvases and print them.
   let images = new Map();

   for (let page of mcs.main.pages.values()) {
      let pageElement = document.querySelector(`.sheet-page-${page.id}`);
      html2canvas(pageElement).then(function(canvas) {
         images.set(page.id, canvas.toDataURL());

         // Got all the pages.
         if (images.size == mcs.main.pages.size) {
            let urls = [];
            for (let imageUrl of images.values()) {
               urls.push(imageUrl);
            }

            let options = {
               printable: urls,
               type: 'image',
               documentTitle: mcs.main.BASE_FILENAME
            };

            printJS(options);
         }
      });
   }
}
