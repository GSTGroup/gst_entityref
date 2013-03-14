
  
(function ($) {
  
  //
  // GST_ENTITYREF Behavior Processing
	Drupal.behaviors.gst_entityref = {
    attach: function(context) {
      jQuery.each(Drupal.settings.gst_entityref, function (selector) {
        if (Drupal.settings.gst_entityref[selector].gstprocess != undefined) { return; }
        var settings = this;
        var gst_entityref_id = '#' + this.id;
        var input_id = '#' + this.input_id;
        var action_links_id = '#' + this.action_links_id;
        var textfield_name = this.textfield_name;
        var source = this.source;
        var resultFilters = this.resultFilters;
        var maxResults = this.maxResults;
        var minQueryLength = this.minQueryLength;
        var resultTextLocator = this.resultTextLocator;
        var alwaysShowList = this.alwaysShowList;
        var resultFormatTemplate = this.resultFormatTemplate;
        var resultFormatter = this.resultFormatter; // gst_entityref_token_formatter | gst_entityref_server_formatter        
        var subFilter = this.subFilter;
        var subFilterDelimiter = this.subFilterDelimiter;
        var queryDelay = this.queryDelay;
        var tokenReplacement = this.tokenReplacement;
        var minLbWidth = this.minLbWidth;
        var select_function = this.select_function;
        
        // YUI Docs: http://yuilibrary.com/yui/docs/autocomplete/
        // YUI Initialization
        var Y = YUI().use('node', 'autocomplete', 'autocomplete-highlighters', 'autocomplete-filters', 'base', 'plugin', 
          function (Y) {
          
          // YUI AC Plugins - needs use('base','plugin')
          //-------------------------------------------------------------------
          var HOST          = 'host',
              BOUNDING_BOX  = 'boundingBox',
              CONTENT_BOX   = 'contentBox';
        
          Y.ACResizeContent = Y.Base.create('ac-resize-content', Y.Plugin.Base, [], {
            _afterRender : function (e) {
                var host = this.get(HOST),                    
                    hostCb = host.get(CONTENT_BOX);
                hostCb.setStyle('overflow', 'auto');
            },
            
            _afterResults : function(e) {
                var host = this.get(HOST),
                    hostBb, hostCb, bbRegion, cbRegion, vpRegion;
          
                if (host.get('visible')) {
                    hostBb = host.get(BOUNDING_BOX),
                    hostCb = host.get(CONTENT_BOX);
                    vpRegion = Y.DOM.viewportRegion();
                    
                    // Set boundingBox Size (width)
                    minWidth = (vpRegion.width < minLbWidth) ? vpRegion.width : minLbWidth;                    
                    bbRegion = hostBb.get('region');
                    if (bbRegion.width < minWidth) {
                      hostBb.setStyle('width', minWidth + 'px'); // set width                      
                      if (bbRegion.left + minWidth > vpRegion.width) { // set left  
                        //console.log('hostBoundingBox.left: ' + (vpRegion.width - minWidth) + 'px | vpRegion.width: ' + vpRegion.width + 'px');
                        //hostBb.setStyle('left', (vpRegion.width - minWidth) + 'px');  //ADFHI: This is not working, so remove it
                      }
                    }
                    
                    //ADFTODO: Figure out a way to fix the contentBox height
                    // Set contentBox Size (height)
                    //hostCb.setStyle('height', '');
                    cbRegion = hostCb.get('region');
                    if (cbRegion.height + cbRegion.top > vpRegion.height) {
                        //console.log('vpRegion.height: ' + vpRegion.height + 'px | cbRegion.top ' + cbRegion.height + 'px');
                        //console.log('set contentBox Height: ' + (vpRegion.height - cbRegion.top) + 'px');
                        //hostCb.setStyle('height', (vpRegion.height - cbRegion.top) + 'px');
                        //hostCb.setStyle('height', (vpRegion.height - cbRegion.height) + 'px');                        
                    }
                }
            },
          
            initializer : function () {
                this.doAfter('render', this._afterRender);
                this.doAfter('results', this._afterResults);
            },
          
            destructor : function () {
                var host = this.get(HOST),
                    hostCb = host.get(CONTENT_BOX);
                hostCb.setStyle('overflow', '');
            }
          }, {
            NS : 'scaler'
          });
          // END YUI AC PLUGINS
          
                   
          
          
          // Configure and handle YUI AutoComplete Widget
          //-------------------------------------------------------------------
          
          // Add the yui3-skin-sam class to the body so the default
          // AutoComplete widget skin will be applied.
          Y.one('body').addClass('yui3-skin-sam');
          
          // 6/1/12ADF: I put the following in to fix issues with ctools-modal - for some reason, when gst_entityref
          // is loaded in the ctools-modal, Y.one(input_id) is null so I have to exit or it breaks other JS
          var Y_input_id = Y.one(input_id);
          if (Y_input_id == undefined) { return; }  // exit if Y.one(input_id) is undefined          
          //var inputNode = Y.one(input_id).plug(Y.Plugin.AutoComplete, {
          var inputNode = Y_input_id.plug(Y.Plugin.AutoComplete, {
            //resultHighlighter: 'phraseMatch',
            resultHighlighter: customHighlighter,
            //ADFTODO: resultFilters is hardcoded to only do phraseMatch filtering.
            // Also, when I try to pass in the resultFilters (see 2 lines below) it does NOT work
            resultFilters: gst_entityref_filter_phraseMatch,
            //resultFilters: resultFilters,
            maxResults: maxResults,
            minQueryLength: minQueryLength,
            resultTextLocator: resultTextLocator,
            // The following will allow all filtering to take place on the SERVER - "token" process on the client
            //resultFormatter: gst_entityref_server_formatter,
            //resultFormatter: gst_entityref_token_formatter,
            //resultFormatter: window[resultFormatter], // THIS DOES NOT WORK
            resultFormatter: gst_entityref_formatter,
            alwaysShowList: alwaysShowList,
            //scrollIntoView: true,   //ADFHI: Not sure what to do - scrollIntoView doesn't work very well
            //activateFirstItem: true,
            queryDelay: queryDelay,
            plugins :  [
                        {fn : Y.ACResizeContent}
                       ],            
            
            //source: ['foo', 'bar', 'baz']
            source: source
            //source: 'http://localhost:8888/men/gst_entityref/search_jsonp/field_e_lesson_fcref3/node/gstevent/{query}/{callback}',
          });
  
          // CLEAR event
          inputNode.ac.on('clear', function (e) {
            var $edit_link = $('.edit-link', action_links_id);
            if ($edit_link.length > 0) {
              // Hide the 'edit' button
              $edit_link.addClass('hide');
            }
          }); // clear event
          
          // SELECT event
          inputNode.ac.on('select', function (e) {
            var result = e.result;
            // Update 'edit' link if we have one
            //console.log('result: ', result);
            //console.log('action_links_id:', action_links_id);            
            
            var $edit_link = $('.edit-link', action_links_id);
            if ($edit_link.length > 0) {
              var edit_link_id = $edit_link.attr('id'); // $edit_link.get(0).id will also work
              //console.log('edit_link:', $edit_link);
              var result_id = result.raw['#'+textfield_name];
              //console.log('edit_link:original href', $edit_link.attr('href'));
              // replace url with format .../node/#NID/edit... with .../node/#NEW-NID/edit...
              var new_href = $edit_link.attr('href').replace(/(.*\/node\/)([0-9]*)(\/edit.*)/, '$1'+result_id+'$3');
              //console.log('edit_link:new href', new_href);
              $edit_link.attr('href', new_href);
              $edit_link.removeClass('hide');       // Unhide if it was hidden
                                          
              // Process CTOOLS / JQuery Links (we have to update these since the 
              //  user may have changed the contents of the input box and we want to edit the *CORRECT* node)
              
              // CTOOLS Modal Link
              if ($edit_link.hasClass('ctools-use-modal')) {
                // Find Drupal.ajax and process the CTOOLS link
                for (var ajax_id in Drupal.ajax) {
                  var ajax_cfg = Drupal.ajax[ajax_id];
                  var ajax_cfg_id = (ajax_cfg.element != undefined) ? ajax_cfg.element.id : -1;
                  if (ajax_cfg_id == edit_link_id) {                    
                    Drupal.ajax[ajax_id].url = ajax_cfg.url.replace(/(.*\/edit\/)([0-9]*)(\/.*)/, '$1'+result_id+'$3');
                    Drupal.ajax[ajax_id].options.url = Drupal.ajax[ajax_id].options.url.replace(/(.*\/edit\/)([0-9]*)(\/.*)/, '$1'+result_id+'$3');
                    //console.log('Found AJAX Settings', ajax_cfg);
                  }
                }                
              }
            }            
            
            // Call select_function if one exists
            var select_fn = window[select_function];
            if (select_function && typeof select_fn == 'function') {
              select_fn(e, settings);
            }
            
          }); // select event
          
          // QUERY event
          // The following handles subMatch queries
          inputNode.ac.on('query', function(e) {
            if (!subFilter) { return; }
            var query = e.query;
            var lastQuery = (e.target.lastQuery != undefined) ? e.target.lastQuery : '';
            var sfd = (subFilterDelimiter != undefined) ? subFilterDelimiter : ',';
            // Compare query to lastQuery - if all they did is type in a , do NOTHING
            if (query == sfd) { 
              e.preventDefault(); return; 
            }  
            // If all they did is "add" a , do NOTHING (wait for them to type some more)
            if (query.length > lastQuery.length && query.substr(lastQuery.length) == sfd) { 
              e.preventDefault(); return; 
            }            
            // Save this query so it can be referred to later
            e.target.lastQuery = query;
          }); // query event
                    
          // This provides NO filter. It relies upon the server to handle filtering.
          // This is primarilyh used for when we filter on a "term" that is not displayed.
          //ADFHI: Fix the no_filter - I should add a filter that filters on ALL passed values
          // (or create a "string" that I can pass that I can filter on, that includes ALL Condition Text)
          function gst_entityref_no_filter(query, results) {
            return results;
          }
          
          //ADFHI: Need to test this - not sure if it works correctly.
          //ADFHI: Currently I "search" on ALL fields in the "raw" array. That INCLUDES fields like entity_id
          //  this is a problem. I need to figure out some way to remove that (perhaps not send it?)
          //  Perhaps I could pre-pend all non-search fields with # since I don't search on those.
          // Filter results on ALL field in the result
          function gst_entityref_filter_phraseMatch(query, results) {
            var lc_query = query.toLowerCase();
            // Iterate through the array of results and return a filtered
            // array containing only results whose text includes the full
            // query.
            return Y.Array.filter(results, function (result) {
              var raw = result.raw;
              var v;
              if (subFilter) {
                var matches = lc_query.split(subFilterDelimiter);
                var found;
                var match;                
                for (var mkey in matches) {
                  match = matches[mkey];                  
                  found = false;
                  match_loop:
                  for (var key in raw) {
                    if (key == undefined) { continue; }
                    if (key[0] == '_' || key[0] == '#') { continue; }
                    v = raw[key];
                    // Search for the "query" in ANY location of ANY field, if it exists, set found to TRUE, and move to next "match" to test
                    if (v.toLowerCase().indexOf(match) !== -1) {
                      found = true;
                      break match_loop; // jump OUT of for loop and UP to the next match to check
                    }
                  } 
                  // break goes to here
                }
                return found;
              } else {
                for (var key in raw) {
                  if (key == undefined) { continue; }
                  v = raw[key];
                  // Search for the "query" in ANY location of ANY field, if it exists, return TRUE
                  if (v.toLowerCase().indexOf(lc_query) !== -1) {
                    return true;
                  }                                    
                }
                return false;   // if we get here, we didn't find it
              }
            });            
          }
          
          function gst_entityref_formatter(query, results) {
            switch (resultFormatter) {
              case 'gst_entityref_server_formatter':
                return gst_entityref_server_formatter(query, results);
                break;;
              case 'gst_entityref_token_formatter':
                return gst_entityref_token_formatter(query, results);
                break;
            }
          }
          // Return the formatted string created by the server
          function gst_entityref_server_formatter(query, results) {
            // Iterate over the array of result objects and return the formattedResult string
            // for each result entry
            var row_num = 0;
            return Y.Array.map(results, function (result) {
              //Y.log(result, "info", "gst_entityref");
              row_num++;
              var raw = result.raw;
              var result = raw['#formattedResult']; // have to ref this way due to the # prefix
              var vals = new Array();
              vals['row_even_odd'] = (row_num % 2 == 0) ? 'even' : 'odd';
              result = Y.Lang.sub(result, vals);       // replace row_even_odd with even|odd
              result = result.replace( /{[a-zA-Z_-]*}/g,"");   // Remove any remaining {token} entries              
              var needle = (subFilter) ? query.split(subFilterDelimiter) : $query;
              // The following has issues with HTML tags - so I wrote some alternate code
              //var hrResult = Y.Highlight.all(result, needle, {'escapeHTML':false});              
              //Y.log("hrResult = " + hrResult, "info", "gst_entityref");
              var hrNodes = $('<div>'+result+'</div>').find('*').each(function() {
                if (this.childElementCount == 0) {
                  this.innerHTML = Y.Highlight.all(this.innerHTML, needle); 
                }
              });
              // For some reason, hrNodes points to the <div result> entry, not the <div> entry
              // so, we have to go to hrNodes parent (the <div>) and then get THAT html() - works fine now.
              var hrText = hrNodes.parent().html();
              return hrText;
              //return hrResult;
              //return result;            
            });
          }
          
          function customHighlighter(query, results) {
            return Y.Array.map(results, function (result) {
              return Y.Highlight.all(result.text, query);
            });
          }
          
          //ADFDONE: Add "highlighting" of subFilter matches "match,match"...
          function gst_entityref_token_formatter(query, results) {
            var row_num = 0;
            return Y.Array.map(results, function (result) {
              row_num++; 
              var raw = result.raw;
              var fmt = Y.Lang.sub(resultFormatTemplate, raw);
              var r = new Array();
              var needle = (subFilter) ? query.split(subFilterDelimiter) : $query;
              for (var key in raw) {
                //Y.log(key + " = " + raw[key], "info", "gst_entityref");
                r[key] = '<span>' + Y.Highlight.all(raw[key], needle) + '</span>';
                //Y.log(key + " ==> " + r[key], "info", "gst_entityref");
              }
              // For some reason, the following does not work - it gives an e.map is not a function error
//              var r = Y.Array.map(raw, function (v) {              
//                var ret = Y.Highlight.all(v, query);              
//                return ret;
//              });
              r['row_even_odd'] = (row_num % 2 == 0) ? 'even' : 'odd';
              var rfmt = Y.Lang.sub(resultFormatTemplate, r);
              rfmt = rfmt.replace( /{[a-zA-Z_-]*}/g,"");   // Remove any remaining {token} entries
              //Y.log("rfmt = " + rfmt, "info", "gst_entityref");
              return rfmt;
            });
          }
        }); // Y.function()
        Drupal.settings.gst_entityref[selector].gstprocess = true;
        
//        $(".gst-entityref:not(.gst-entityref-processed)", context).addClass("gst-entityref-processed").each(function () {
//          gst_entityref_processing(this); // pass in the context of the element being processed
//        });    
      });
    }
  };
	
  function gst_entityref_processing(context) {    
      // Each Element that has class="gst-entityref" will be processed.
      //
      var $ele = $(context);
//    ele_input = $ele.find()
//    $('.vertical-tabs-pane').each(function(){
//      var $ele = $(this),
//        ele_desc = $ele.find('.text-format-wrapper div.description'),
//        ele_form_textarea_wrapper = $ele.find('.text-format-wrapper div.form-textarea-wrapper');
//
//      // Insert the "description" div BEFORE the form-textarea-wrapper div      
//      $(ele_form_textarea_wrapper).before(ele_desc.clone().addClass('top'));
//      ele_desc.addClass('bottom');
//    });
  }
    
})(jQuery);	