'use strict';

var mcs = mcs || {};

mcs.constants = {};
mcs.constants.DEFAULT_BOX_WIDTH = 50;
mcs.constants.DEFAULT_BOX_HEIGHT = 50;

$(document).ready(function() {
   document.getElementById('background-upload').addEventListener('change', handleFileSelect, false);
});

function clickUpload() {
   $('#background-upload').click();
}

function serialize() {
   var dump = {
      pages: []
   };

   var page = {
      background: $('.background-image').attr('src'),
      boxes: []
   };

   mcs.boxes = mcs.boxes || [];
   mcs.boxes.forEach(function(box) {
      page.boxes.push({
         id: box.getAttribute('data-id'),
         name: box.getAttribute('data-name'),
         value: box.getAttribute('data-value'),
         x: box.getAttribute('data-x') || 0,
         y: box.getAttribute('data-y') || 0,
         width: box.style.width,
         height: box.style.height,
      });
   });

   dump.pages.push(page);

   return JSON.stringify(dump);
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

function getBoxSelector(id) {
   return '.box[data-id="' + id + '"]';
}

function addBox() {
   mcs.boxes = mcs.boxes || [];

   var id = mcs.boxes.length;

   var box = document.createElement('div');
   box.className = 'box';
   box.setAttribute('data-id', id);
   box.setAttribute('data-name', '');
   box.setAttribute('data-value', '');
   box.style.width = mcs.constants.DEFAULT_BOX_WIDTH;
   box.style.height = mcs.constants.DEFAULT_BOX_HEIGHT;
   box.setAttribute('onClick', 'selectBox(' + id + ');');

   mcs.boxes.push(box);
   $('.page-pane').append(box);

   makeDragable(id);
}

function makeDragable(id) {
   interact(getBoxSelector(id))
      .draggable({
         onmove: window.dragMoveListener,
         restrict: {
            restriction: 'parent',
            elementRect: {
               top: 0,
               left: 0,
               bottom: 1,
               right: 1
            }
         },
      })
      .resizable({
         // resize from all edges and corners
         edges: {
            left: true,
            right: true,
            bottom: true,
            top: true
         },

         // keep the edges inside the parent
         restrictEdges: {
            outer: 'parent',
            endOnly: true,
         },

         // minimum size
         restrictSize: {
            min: {
               width: 20,
               height: 20
            },
         },

         inertia: false,
      })
      .on('resizemove', function (event) {
         var target = event.target;
         var x = (parseFloat(target.getAttribute('data-x')) || 0);
         var y = (parseFloat(target.getAttribute('data-y')) || 0);

         // update the element's style
         target.style.width = event.rect.width + 'px';
         target.style.height = event.rect.height + 'px';

         // translate when resizing from top or left edges
         x += event.deltaRect.left;
         y += event.deltaRect.top;

         target.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
         target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

         target.setAttribute('data-x', x);
         target.setAttribute('data-y', y);
      })
      .on('dragmove', function(event) {
         var target = event.target;
         var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
         var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

         target.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
         target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

         target.setAttribute('data-x', x);
         target.setAttribute('data-y', y);
      });
}

function selectBox(id) {
   if (mcs.selected == id) {
      return;
   }
   mcs.selected = id;

   $('.box').removeClass('selected');
   $(getBoxSelector(id)).addClass('selected');

   fillBoxContext(id);
}

function fillBoxContext(id) {
   $('.context-pane').empty();
   addBoxContextButtons(id);

   var box = $(getBoxSelector(id));

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
   $(getBoxSelector(id)).attr('data-name', name);

   var value = $('.context-pane .context-value').val();
   $(getBoxSelector(id)).attr('data-value', value);
   $(getBoxSelector(id)).html(value);
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

   var data = serialize();

   // TEST
   console.log(data);
}

function viewMode() {
   // TODO(eriq)
   console.log("View Mode");
}

