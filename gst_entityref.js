
  
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
        
        // YUI Initialization
        var Y = YUI().use('node', 'autocomplete', 'autocomplete-highlighters', 'autocomplete-filters', function (Y) {
          // Add the yui3-skin-sam class to the body so the default
          // AutoComplete widget skin will be applied.
          Y.one('body').addClass('yui3-skin-sam');
          
          Y.one(input_id).plug(Y.Plugin.AutoComplete, {
            resultHighlighter: 'phraseMatch',
            resultFilters: resultFilters,
            //source: ['foo', 'bar', 'baz']
            source: source
            //source: 'http://localhost:8888/men/gst_entityref/search_jsonp/field_e_lesson_fcref3/node/gstevent/{query}/{callback}',
          });
          
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