'use strict';

var mcs = mcs || {};
mcs.main = mcs.main || {};

// TODO(eriq): Custom filenames.
mcs.main.BASE_FILENAME = 'character_sheet'
mcs.main.FILENAME = mcs.main.BASE_FILENAME + '.mcs'

mcs.main.sheetName = mcs.main.sheetName || 'Unnamed Sheet';
mcs.main.pages = mcs.main.pages || new Map();

// All the cells on the sheet.
// Keeping it as a map makes JSON operations harder, but is more robust in the end.
mcs.main.cells = mcs.main.cells || new Map();
mcs.main.nextCellId = mcs.main.nextCellId || 0;

mcs.main.selectedPage = mcs.main.selectedPage || null;
mcs.main.selectedCell = mcs.main.selectedCell || null;

function clickUploadBackground(pageId) {
   $(`.background-upload-button-${pageId}`).click();
}

function clickLoadSheet() {
   $('.load-sheet.hidden-upload-button').click();
}

function serialize() {
   let dump = {
      nextCellId: mcs.main.nextCellId,
      sheetName: mcs.main.sheetName,
      pages: [...mcs.main.pages],
      cells: [...mcs.main.cells]
   };

   return JSON.stringify(dump, null, 4);
}

function deserialize(text) {
   let data = JSON.parse(text);

   clearSheet();

   mcs.main.sheetName = data.sheetName;
   $('.sheet-name').val(mcs.main.sheetName);

   mcs.main.nextCellId = data.nextCellId;

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

function clearSheet() {
   // Clear state.
   mcs.main.pages = new Map();

   mcs.main.cells = new Map();
   mcs.main.nextCellId = 0;

   mcs.main.selectedPage = null;
   mcs.main.selectedCell = null;

   // Clear display.
   $('.cell-context').empty();
   $('.page-context').empty();
   $('.page-pane').empty();
}

function changeSheetName(event) {
   mcs.main.sheetName = event.target.value;
   $('.sheet-name').val(mcs.main.sheetName);
}

function handleSheetFileSelect(event) {
   let files = document.querySelector('.load-sheet.hidden-upload-button').files;

   if (files.length == 0) {
      return;
   }

   if (files.length != 1) {
      console.error("Wrong number of files. Expected 1, got " + files.length + ".");
      return;
   }

   let file = files[0];

   let reader = new FileReader();
   reader.onload = function(event) {
      document.querySelector('.load-sheet.hidden-upload-button').value = null;
      deserialize(event.target.result);
   };

   reader.readAsText(file);
}

function handleBackgroundFileSelect(id) {
   let files = document.querySelector(`.background-upload-button-${id}`).files;

   if (files.length == 0) {
      return;
   }

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

   let pageHeader = document.createElement('span');
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
      // Offset so even if we are scrolling, the box appears in the top left.
      let x = $(`.sheet-page-${pageId}`).get(0).scrollLeft;
      let y = Math.max(0, window.pageYOffset - $(`.sheet-page-${pageId}`).get(0).offsetTop + $('.top-bar').height());

      id = mcs.main.nextCellId;
      mcs.main.nextCellId++;
      cell = new mcs.cell.Cell({id: id, page: pageId, x: x, y: y});
   } else {
      id = cell.id;
      pageId = cell.page;
   }

   if (id > mcs.main.nextCellId) {
      mcs.main.nextCellId = id + 1;
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

   cell.getDetailsForm().forEach(function({labelText, field, prefix = ''}) {
      if (mcs.util.nil(field)) {
         let span = document.createElement('span');
         span.innerHTML = labelText;
         $('.cell-context').append(span);
         return;
      }

      let label = document.createElement('label');
      label.innerHTML = labelText + ': ' + prefix;

      let wrap = document.createElement('div');
      wrap.className = 'context-wrap';

      wrap.appendChild(label);
      wrap.appendChild(field);

      $('.cell-context').append(wrap);
   });

   let deleteButton = document.createElement('button');
   deleteButton.innerHTML = 'Delete Cell';
   deleteButton.setAttribute('onClick', 'deleteCell(' + cell.id + ');');
   $('.cell-context').append(deleteButton);
}

function deleteCell(id) {
   let cell = mcs.main.cells.get(id);

   // Get rid of any display elements.
   $(cell.getSelector()).remove();
   mcs.main.cells.delete(id);
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

   // Clear any selections.
   mcs.main.selectedCell = null;
   mcs.main.selectedPage = null;
   $('.cell-context').empty();
   $('.page-context').empty();

   // Replace all cells with display versions.
   $('.cell').remove();

   // TODO(eriq): Better error handling.

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
      let cell = mcs.main.cells.get(id);
      $(cell.getSelector()).val(result);
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
            let urls = new Array(images.size);
            for (let [id, imageUrl] of images.entries()) {
               urls[id] = imageUrl;
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
