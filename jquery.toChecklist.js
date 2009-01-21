/**
 * toChecklist plugin for jQuery 1.2.6+
 * @author Scott Horlbeck <me@scotthorlbeck.com>
 * @url http://www.scotthorlbeck.com/code/tochecklist
 * @version 1.0.1
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details (LICENSE.txt or
 * http://www.gnu.org/copyleft/gpl.html)
 *
 * Thanks to the UNM Health Sciences Library and Informatics Center
 * (http://hsc.unm.edu/library/) for funding the initial creation
 * of this plugin and allowing me to publish it as open source software.
*/
(function($) {

jQuery.fn.toChecklist = function(o) { // "o" stands for options

	// Since o can be a string instead of an object, we need a function that
	// will handle the action requested when o is a string (e.g. 'clearAll')
	var updateChecklist = function(action,checklistElem) {
					
		// Before we operate on all checkboxes, we need to make sure that
		// showSelectedItems is disabled, at least temporarily. Otherwise,
		// this process will be REALLY slow because it tries to update the
		// DOM a thousand times unnecessarily.
		var showSelectedItemsSetting = $(checklistElem).attr('showSelectedItems');
		$(checklistElem).attr('showSelectedItems', 'false');

		// Grab each li in the checklist...
		var checklistLength = $('li',checklistElem).length;
		$('li',checklistElem).each(function(i) {

			switch(action) {
				case 'clearAll' :
					// If it's checked, force the click event handler to run.
					if ($('input:checkbox',this).attr('checked')) {
						$(this).trigger('click');
					}
					break;
				case 'checkAll' :
					// If it's unchecked and not disabled, force the click event handler to run.
					if (!$('input:checkbox',this).attr('checked') && !$('input:checkbox',this).attr('disabled')) {
						$(this).trigger('click');
					}
					break;
				case 'invert' :
					$(this).trigger('click');
					break;
				default :
					alert("toChecklist Plugin says:\n\nWarning - Invalid action requested on checklist.\nThe action requested was: " + action);
					break;
			}
			
			// Before we check/uncheck the penultimate item in the list, we need to restore
			// the showSelectedItems setting to its original setting, so that we update the
			// list of selected items appropriately on the last item we check/uncheck.
			if (i == checklistLength - 2)
				$(checklistElem).attr('showSelectedItems', showSelectedItemsSetting);

		});

	};
	
	// If o is a simple string, then we're updating an existing checklist
	// (i.e. 'checkAll') instead of converting a regular multi-SELECT box.
	if (typeof o == 'string') {
		this.each(function() {
			if ( !$(this).isChecklist() )
				return true; // return true is same as 'continue'
			updateChecklist(o,this);
		});
		return $;
	}

	// Provide default settings, which may be overridden if necessary.
	o = jQuery.extend({

		addScrollBar : true,
		addSearchBox : false,
		showCheckboxes : true,
		showSelectedItems : false,

		// In case of name conflicts, you can change the class names to whatever you want to use.
		cssChecklist : 'checklist',
		cssChecklistHighlighted : 'checklistHighlighted',
		cssLeaveRoomForCheckbox : 'leaveRoomForCheckbox', // For label elements
		cssEven : 'even',
		cssOdd : 'odd',
		cssChecked : 'checked',
		cssDisabled : 'disabled',
		cssShowSelectedItems : 'showSelectedItems',
		cssFocused : 'focused', // This cssFocused is for the li's in the checklist
		cssFindInList : 'findInList',
		cssBlurred : 'blurred' // This cssBlurred is for the findInList divs.

	}, o);

	var error = function(msg) {
		alert("jQuery Plugin Error (Plugin: toChecklist)\n\n"+msg);
	}
	
	var overflowProperty = (o.addScrollBar)? 'overflow-y: auto; overflow-x: hidden;' : '';
	var leaveRoomForCheckbox = (o.showCheckboxes)? 'padding-left: 25px' : 'padding-left: 3px';

	// Here, THIS refers to the jQuery stack object that contains all the target elements that
	// are going to be converted to checklists. Let's loop over them and do the conversion.
	this.each(function() {

		// Hang on to the important information about this <select> element.
		var jSelectElem = $(this);
		var jSelectElemId = jSelectElem.attr('id');
		if (jSelectElemId == '') {
			jSelectElemId = jSelectElem.attr('name'); // This probably isn't a good idea...	
		}

		var h = jSelectElem.height(); /* : '100%'; */
		var w = jSelectElem.width();
		// We have to account for the extra thick left border.
		w -= 4;


		// Make sure it's a SELECT element, and that it's a multiple one.
		if (this.type != 'select-multiple' && this.type != 'select-one') {
			error("Can't convert element to checklist.\n"
				+"Expecting SELECT element with \"multiple\" attribute.");
			return $;
		} else if (this.type == 'select-one') {
			return $;
		}

		// Loop through all the options and convert them to li's
		// with checkboxes and labels.		
		$('option',jSelectElem).each(function() {
			var checkboxValue = $(this).attr('value');
			// The option tag may not have had a "value" attribute set. In this case,
			// Firefox automatically uses the innerHTML instead, but we need to set it
			// manually for IE.
			if (checkboxValue == '') {
				checkboxValue = this.innerHTML;
			}
			checkboxValue = checkboxValue.replace(/ /g,'_');
			
			var checkboxId = jSelectElemId+'_'+checkboxValue;
			var labelText = $(this).attr('innerHTML');
			var selected = '';
			if ($(this).attr('disabled')) {
				var disabled = ' disabled="disabled"';
				var disabledClass = ' class="disabled"';
			} else {
				var disabled = '';
				var disabledClass = '';
				var selected = ($(this).attr('selected'))? 'checked="checked"' : '';
			}

			$(this).replaceWith('<li tabindex="0"><input type="checkbox" value="'+checkboxValue
				+'" name="'+jSelectElemId+'" id="'+checkboxId+'" ' + selected + disabled
				+' /><label for="'+checkboxId+'"'+disabledClass+'>'+labelText+'</label></li>');
			// Hide the checkboxes.
			if (o.showCheckboxes === false) {
				$('#'+checkboxId).css('display','none');
			} else {
				$('label[for='+checkboxId+']').addClass(o.cssLeaveRoomForCheckbox);	
			}
		});
		
		var checklistId = jSelectElemId+'_'+'checklist';

		// Convert the outer SELECT elem to a <div>
		// Also, enclose it inside another div that has the original id, so developers
		// can access it as before. Also, this allows the search box to be inside
		// the div as well.
		jSelectElem.replaceWith('<div id="'+jSelectElemId+'"><div id="'+checklistId+'">'
			+'<ul>'+jSelectElem.attr('innerHTML')+'</ul></div></div>');
		var checklistDivId = '#'+checklistId;

		// We're going to create a custom HTML attribute in the main div box (the one
		// that contains the checklist) to store our value for the showSelectedItems
		// setting. This is necessary because we may need to change this value dynamically
		// after the initial conversion in order to make it faster to check/uncheck every
		// item in the list.
		$('#'+jSelectElemId).attr('showSelectedItems',o.showSelectedItems.toString());
		
		// We MUST set the checklist div's position to either 'relative' or 'absolute'
		// (default is 'static'), or else Firefox will think the offsetParent of the inner
		// elements is BODY instead of DIV.
		$(checklistDivId).css('position','relative');

		// Add the findInList div, if settings call for it.
		var findInListDivHeight = 0;
		if (o.addSearchBox) {
			
			var focusSearchBox = function() {
				// Remove "type to find..." when focusing.
				this.value = "";
				$(this).removeClass(o.cssBlurred);
			}
			var blurSearchBox =function() {
				// Restore default text on blur.
				this.value = this.defaultValue;
				$(this).addClass(o.cssBlurred);
			}

			$(checklistDivId).before('<div class="findInList" id="'+jSelectElemId+'_findInListDiv">'
				+'<input type="text" value="Type here to search list..." id="'
				+jSelectElemId+'_findInList" class="'+o.cssBlurred+'" /></div>');

			// Set width to same as original SELECT element.
			$('#'+jSelectElemId+'_findInList').css('width',w);
			$('#'+jSelectElemId+'_findInList')
			// Attach event handlers to the input box...
			.bind('focus.focusSearchBox', focusSearchBox)
			.bind('blur.blurSearchBox',blurSearchBox)
			.keyup(function(event) {
				// Search for the actual text.
				var textbox = this; // holder
				if (this.value == '') {
					$(checklistDivId).attr('scrollTop',0);
					$(this).unbind('keydown.tabToFocus');
					return false;
				}
				// Scroll to the text, unless it's disabled.
				$('label',checklistDivId).each(function() {
					if ( !$(this).is(':disabled') ) {
						var curItem = $(this).html().toLowerCase();
						var typedText = textbox.value.toLowerCase();
						
						if ( curItem.indexOf(typedText) == 0 ) { // If the label text begins
						                                         // with the text typed by user...
							var curLabelObj = this;
							var scrollValue = this.parentNode.offsetTop; // Can't use jquery offset()
							$(checklistDivId).attr('scrollTop',scrollValue);
							// We want to be able to simply press tab to move the focus from the
							// search text box to the item in the list that we found with it.
							$(textbox).unbind('blur.blurSearchBox').unbind('keydown.tabToFocus')
							.bind('keydown.tabToFocus', function(event) {
								if (event.keyCode == 9) {
									event.preventDefault(); // No double tabs, please...
									$(curLabelObj.parentNode).bind('blur.restoreDefaultText',function() {
										// This function restores the default text to the search box when
										// you navigate away from a list item that is focused.
										var defaultVal = $(textbox).attr('defaultValue');
										$(textbox).attr('value',defaultVal).addClass(o.cssBlurred)
										.bind('blur.blurSearchBox',blurSearchBox);
										$(this).unbind('blur.restoreDefaultText');
									}).bind('keydown.tabBack', function(event) {
										// This function lets you shift-tab to get back to the search box easily.
										if (event.keyCode == 9 && event.shiftKey) {
											event.preventDefault(); // No double tabs, please...
											$(textbox)
											.unbind('focus.focusSearchBox')
											.removeClass(o.cssBlurred)
											.bind('focus.focusSearchBox',focusSearchBox)
											.bind('blur.blurSearchBox',blurSearchBox).focus();
											$(this).unbind('keydown.tabBack');
										}
									}).focus(); // Focuses the actual list item found by the search box
									$(this).unbind('keydown.tabToFocus');
								}
							});
							return false; // Equivalent to "break" within the each() function.
						}
					}
				});
				return;
			
			});

			// Compensate for the extra space the search box takes up by shortening the
			// height of the checklist div. Also account for margin below the search box.
			findInListDivHeight = $('#'+jSelectElemId+'_findInListDiv').height() + 3;

		}

		// ============ Add styles =============

		$(checklistDivId).addClass(o.cssChecklist);
		if (o.addScrollBar) {
			$(checklistDivId).height(h - findInListDivHeight).width(w);
		} else {
			$(checklistDivId).height('100%').width(w);
		}
		$('ul',checklistDivId).addClass(o.cssChecklist);

		// Stripe the li's
		$('li:even',checklistDivId).addClass(o.cssEven);
		$('li:odd',checklistDivId).addClass(o.cssOdd);
		// Emulate the :hover effect for keyboard navigation.
		$('li',checklistDivId).focus(function() {
			$(this).addClass(o.cssFocused);
		}).blur(function(event) {
			$(this).removeClass(o.cssFocused);
		}).mouseout(function() {
			$(this).removeClass(o.cssFocused);
		});
			
		// Highlight preselected ones.
		$('li',checklistDivId).each(function() {
			if ($('input',this).attr('checked')) {
				$(this).addClass(o.cssChecked);	
			}
		});

		// ============ Event handlers ===========

		var toggleDivGlow = function() {
			// Make sure the div is glowing if something is checked in it.			
			if ($('li',checklistDivId).hasClass(o.cssChecked)) {
				$(checklistDivId).addClass(o.cssChecklistHighlighted);
			} else {
				$(checklistDivId).removeClass(o.cssChecklistHighlighted);
			}
		}

		// Check/uncheck boxes
		var check = function(event) {
			
			// This needs to be keyboard accessible too. Only check the box it if the user
			// presses space (enter typically submits a form, so is not safe).
			if (event.type == 'keydown') {
				// Pressing spacebar in IE and Opera triggers a Page Down. We don't want that
				// to happen in this case. Opera doesn't respond to this, unfortunately...
				// We also want to prevent form submission with enter key.
				if (event.keyCode == 32 || event.keyCode == 13) event.preventDefault();
				// Tab keys need to move to the next item in IE, Opera, Safari, Chrome, etc.
				if (event.keyCode == 9 && !event.shiftKey) {
					event.preventDefault();
					// Move to the next LI
					$(this).unbind('keydown.tabBack').blur().next().focus();
					
				} else if (event.keyCode == 9 && event.shiftKey) {
					// Move to the previous LI
				}

				if (event.keyCode != 32) return;
			}

			// Not sure if unbind() here removes default action, but that's what I want.
			$('label',this).unbind(); 
			// Make sure that the event handler isn't triggered twice (thus preventing the user
			// from actually checking the box) if clicking directly on checkbox or label.
			// Note: the && is not a mistake here. It should not be ||
			if (event.target.tagName != 'INPUT' && event.target.tagName != 'LABEL') {
				$('input',this).trigger('click');
			}

			// Change the styling of the row to be checked or unchecked.
			var checkbox = $('input',this).get(0);
			updateLIStyleToMatchCheckedStatus(checkbox);
			
			// The showSelectedItems setting can change after the initial conversion to
			// a checklist, so rather than checking o.showSelectedItems, we check the
			// value of the custom HTML attribute on the main containing div.
			if ($('#'+jSelectElemId).attr('showSelectedItems') === 'true') showSelectedItems();

		};
		
		var updateLIStyleToMatchCheckedStatus = function(checkbox) {
			if (checkbox.checked) {
				$(checkbox).parent().addClass(o.cssChecked);
			} else {
				$(checkbox).parent().removeClass(o.cssChecked);
			}
			toggleDivGlow();
		}
		
		// Accessibility, primarily for IE
		var handFocusToLI = function() {
			// Make sure that labels and checkboxes that receive
			// focus divert the focus to the LI itself.
			$(this).parent().focus();
		};

		$('li',checklistDivId).click(check).keydown(check);
		$('label',checklistDivId).focus(handFocusToLI);
		$('input',checklistDivId).focus(handFocusToLI);
		toggleDivGlow();

		// Make sure that resetting the form doesn't leave highlighted divs where
		// they shouldn't be and vice versa.
		var fixFormElems = function(event) {
			$('input',this).each(function() {
				this.checked = this.defaultChecked;
				updateLIStyleToMatchCheckedStatus(this);
				if (o.showSelectedItems) showSelectedItems();
			}).parent();
		}
		$('form:has(div.'+o.cssChecklist+')').bind('reset.fixFormElems',fixFormElems);
		
		
		// ================== List the selected items in a UL ==========================
		
		var selectedItemsListId = '#'+jSelectElemId + '_selectedItems';
		if (o.showSelectedItems) {
			$(selectedItemsListId).addClass(o.cssShowSelectedItems);
		}

		var showSelectedItems = function() {
			// Clear the innerHTML of the list and then add every item to it
			// that is highlighted in the checklist.
			$(selectedItemsListId).html('');
			$('label',checklistDivId).each(function() {
				if ($(this).parent().hasClass(o.cssChecked)) {
					var labelText = jQuery.trim(this.innerHTML);
					$(selectedItemsListId).append('<li>'+labelText+'</li>');
				}
			});
		};
		
		// We have to run showSelectedItems() once here too, upon initial conversion.
		if (o.showSelectedItems) showSelectedItems();

	});

};

// Returns boolean value for the first matched element.
jQuery.fn.isChecklist = function() {
	var isChecklist = false; // Innocent until proven guilty...
	this.each(function() {
		var divContainsChecklist = $('#'+this.id+'_checklist',this).get();	
		isChecklist = (this.tagName == 'DIV' && divContainsChecklist);
		return false; // same as "break"
	});
	// isChecklist will either be an HTML object here or undefined,
	// and we want to specifically return true or false.
	return (isChecklist)? true : false;
};

})(jQuery);