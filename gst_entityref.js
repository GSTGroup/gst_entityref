
  
(function ($) {

  
  //
  // GST_ENTITYREF Behavior Processing
	Drupal.behaviors.gst_entityref = {
    attach: function(context) {
      jQuery.each(Drupal.settings.gst_entityref, function (selector) {
        var gst_entityref_id = '#' + this.id;
        var input_id = '#' + this.input_id;
        var source = this.source;
        var resultFilters = this.resultFilters;
        var maxResults = this.maxResults;
        var minQueryLength = this.minQueryLength;
        var resultTextLocator = this.resultTextLocator;
        var alwaysShowList = this.alwaysShowList;
        var resultFormatTemplate = this.resultFormatTemplate;
        
        // YUI Initialization
        var Y = YUI().use('node', 'autocomplete', 'autocomplete-highlighters', 'autocomplete-filters', function (Y) {
          // Add the yui3-skin-sam class to the body so the default
          // AutoComplete widget skin will be applied.
          Y.one('body').addClass('yui3-skin-sam');
          
          Y.one(input_id).plug(Y.Plugin.AutoComplete, {
            //resultHighlighter: 'phraseMatch',
            resultHighlighter: customHighlighter,
            //resultFilters: resultFilters,
            //resultFilters: gst_entityref_no_filter,
            resultFilters: gst_entityref_filter_phraseMatch,
            maxResults: maxResults,
            minQueryLength: minQueryLength,
            resultTextLocator: resultTextLocator,
            //resultFormatter: gst_entityref_server_formatter,
            resultFormatter: gst_entityref_token_formatter,
            alwaysShowList: alwaysShowList,
            //activateFirstItem: true,
            
            //source: ['foo', 'bar', 'baz']
            source: source
            //source: 'http://localhost:8888/men/gst_entityref/search_jsonp/field_e_lesson_fcref3/node/gstevent/{query}/{callback}',
          });
  
          // This provides NO filter. It relies upon the server to handle filtering.
          // This is primarilyh used for when we filter on a "term" that is not displayed.
          //ADFHI: Fix the no_filter - I should add a filter that filters on ALL passed values
          // (or create a "string" that I can pass that I can filter on, that includes ALL Condition Text)
          function gst_entityref_no_filter(query, results) {
            return results;
          }
          
          // Filter results on ALL field in the result
          function gst_entityref_filter_phraseMatch(query, results) {
            var lc_query = query.toLowerCase();
            // Iterate through the array of results and return a filtered
            // array containing only results whose text includes the full
            // query.
            return Y.Array.filter(results, function (result) {
              var raw = result.raw;
              var v;
              for (var key in raw) {
                if (key == undefined) { continue; }
                v = raw[key];
                Y.log(key + " = " + v, "info", "gst_entityref");
                // Search for the "query" in ANY location of ANY field, if it exists, return TRUE
                if (v.toLowerCase().indexOf(lc_query) !== -1) {
                  return true;
                }
              }
              return false;              
            });            
          }
          
          // Return the formatted string created by the server
          function gst_entityref_server_formatter(query, results) {
            // Iterate over the array of result objects and return the formattedResult string
            // for each result entry
            return Y.Array.map(results, function (result) {
              //Y.log(result, "info", "gst_entityref");
              var raw = result.raw;
              var result = raw.formattedResult;
              var hr = Y.Highlight.all(result, query);
              return result.raw.formattedResult;            
            });
          }
          
          function customHighlighter(query, results) {
            return Y.Array.map(results, function (result) {
              return Y.Highlight.all(result.text, query);
            });
          }
          
          function gst_entityref_token_formatter(query, results) {
            var row_num = 0;
            return Y.Array.map(results, function (result) {
              row_num++; 
              var raw = result.raw;
              var fmt = Y.Lang.sub(resultFormatTemplate, raw);
              var r = new Array();
              for (var key in raw) {
                //Y.log(key + " = " + raw[key], "info", "gst_entityref");
                r[key] = '<span>' + Y.Highlight.all(raw[key], query) + '</span>';
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
        });
        
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