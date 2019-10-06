window.scrollTops = { 'main': 							 0, 'decision_algorithm': 0, 
                      'causal_markov_model': 0, 'causal_model': 		  0, 
                      'lib': 								 0, 'setlx': 							0 };
window.active_tab = 'main';

$(document).ready(function() {
  abbr = { 'decision_algorithm': 'da', 'causal_model': 'cm', 
           'causal_markov_model': 'cmm', 'main': 'm', 'lib': 'l',
           'test_decision_algorithm': 'tda', 'test_causal_model': 'tcm',
           'test_causal_markov_model': 'tcmm', 'test_main': 'main',
           'test_lib': 'tl' };

  if (window.dev) {
    // Note: Keep this before adding proc links and not live (ajax)
    $('.vimCodeElement .Comment a').attr('target', '_blank');

    $('.Comment').each(function(j) {
      var m = $(this).html().match(/(===|---)/);			
      if (m && m.length) {
        $(this).addClass('Heading');
        $(this).prevUntil('.Comment').last().prev().addClass('Heading');
      }
    });
    
    // Set up proc data
    window.procs = { };
    window.proc_names = [];
    window.names = {};
    $('.vimCodeElement').each(function(j) {
      var file = $(this).attr('id');
      window.procs[file] = {};
      $(this).find('.LineNr').each(function(i) {
        var num = i + 1;
        var spans = $(this).nextUntil('.LineNr');
        if ( spans.length >= 3                         &&
             $(spans[0]).attr('class') == 'Identifier' &&
             $(spans[1]).html() == ':='                &&
             ( $(spans[2]).html() == 'procedure' || 
               $(spans[2]).html() == 'cachedProcedure' ) 
           ) {
          proc_name = $(spans[0]).html();
          window.proc_names.push([proc_name, file, num]);
          window.procs[file][proc_name] = num;
          if (!window.names[proc_name]) {
            window.names[proc_name] = [];
          } 
          window.names[proc_name].push([proc_name, file, num]);
        }
      });
    });

    // Add checkmark links to tests
    for (i in window.proc_names) {
      proc_arr = window.proc_names[i];
      var proc_name = proc_arr[0];
      var file = proc_arr[1];
      var num = proc_arr[2];
      var test_name = 'test_' + proc_name;
      var procs = window.names[test_name];
      var test_file = 'test_' + file;
      if (proc_name.slice(0,5) != 'test_' && procs) {
        // console && console.log(procs);
        var test_arrs = procs.filter(test_proc_arr => test_file == test_proc_arr[1]);
        // console && console.log(test_arrs);
        var test_arr = null;
        if (test_arrs.length) { 
          test_arr = test_arrs[0]; 
        }
        if (test_arr) {
          // console && console.log('found test')
          var line_no = $('#' + file + ' #L' + num);
          // test_arr = window.names[test_name][0];
          test_num = test_arr[2];
          line_no.prepend(
            '<a href="#' + abbr[test_file] + '-' + test_num + '"' + 
               'data-file="' + test_file + '" title="' + test_name + '"' + 
               'class="checkmark">' +
              // '&#10004;' 
              'chkmrk'
              + '</a>'
          );
          test_line_no = $('#' + test_file + ' #L' + test_num);
          test_line_no.prepend(
            '<a href="#' + abbr[file] + '-' + num + '"' + 
               'data-file="' + file + '" title="' + proc_name + '"' + 
               'class="back_to_proc">' +
              // '&#8629;' 
              'arrw'
              + '</a>'
          );
        }
      }
    } 
    //$('.checkmark').each(function() {
      // window.parse_anchor_hash();
      // var file = $(this).attr('file');
    //});
    
    // Populate Glossary
    var some_proc_names = window.proc_names;
    some_proc_names = some_proc_names.filter(arr => 
      ['main', 'decision_algorithm', 'causal_markov_model', 
       'causal_model', 'lib'].includes(arr[1])
    );
    some_proc_names = some_proc_names.sort(); 
    var l = some_proc_names.length;
    var half = parseInt(l/2); 
    proc_link = function(arr) { // arr is [proc_name, file, num]
      proc_name = arr[0];
      prefix = '';
      if (window.names[proc_name].length && 
          window.names[proc_name].length > 1) {
        // arr is array of array3s, multiple procs
        prefix = abbr[arr[1]] + ':';
      }
      return ' <a href="#' + abbr[arr[1]] + '-' + arr[2] + 
               '" data-file="' + arr[1] + 
               '" class="Identifier" title="' + prefix + arr[0] + '">' + 
                 prefix + arr[0] + 
              '</a> ';
    }
    $.each(some_proc_names.slice(0, half + l%2), function(i, arr) {
      $('#glossary #col1').append(proc_link(arr));
    });
    $.each(some_proc_names.slice(half + l%2, l), function(i, arr) {
      $('#glossary #col2').append(proc_link(arr));
    });

    // Turn proc links lavender
    $('.vimCodeElement .Identifier').each(function() {
      var last_span = $(this).prev('span');
      var name = $(this).html();
      if (!(last_span && last_span.hasClass('LineNr')) && 
          window.names[name]) {
        var arr = window.names[name][0];
        var file = arr[1];
        var num = arr[2];
        $(this).replaceWith(
          '<a class="Identifier code-proc-link" ' + 
             'href="#' + abbr[file] + '-' + num + '">' + 
            name +
          '</a>'
        );
      }
    });

    // add anchors to concepts
    $('#concepts a').each(function() {
      var file = $(this).data('file');
      var name = $(this).data('name');
      var num = window.procs[file][name];
      if (num) {
        $(this).attr('href', '#' + abbr[file] + '-' + num);
      }
    });
  } // end if dev

  // Select Tab
  window.select_tab = function(file) {
    window.active_tab = file;
    if (file.slice(0,5) == 'test_') {
      file = file.replace(/test_/, '');
    }
    $('.file').removeClass('selected');
    $('.vimCodeElement').removeClass('selected');

    $('#' + file + '_tab').addClass('selected');			
    $('#' + file).addClass('selected');
    $('#test_' + file).addClass('selected');
    // $('html, body').scrollTop(window.scrollTops[file]);
    $(window).scrollTop(window.scrollTops[file]);
  }

  $(window).scroll(function() {
    window.scrollTops[window.active_tab] = $(window).scrollTop();
  });

  // highlight proc
  window.blink = function(j_el) {
    j_el.css('background', 'white');						
    j_el.css('color', '#333');
    setTimeout(function() { 
                 j_el.css('background', ''); j_el.css('color', '') 
               }, 3000);
  };

  window.scroll_to_line = function(file, num) {
    var line_no = $('#' + file + ' #L' + num);
    if (line_no.length) {
      if (!$('#' + file).hasClass('selected')) {
        window.select_tab(file);
      }
      var scroll_top = line_no.offset()['top'];
      scroll_top = scroll_top - 200;
      $('html, body').animate({ scrollTop: scroll_top + 'px'}, 1000);
      window.blink(line_no);
    }
  }

  // Parse Anchor Hash
  window.parse_anchor_hash = function() {
    var hash = document.location.hash;
    if (hash && hash != '') {
      var arr = hash.replace(/#/, '').split('-');
      var file_abbr = arr[0];
      var file = Object.keys(abbr).find(key => abbr[key] == file_abbr);
      if (file) {
        var num = arr[1];			
        window.scroll_to_line(file, num);
      } else if (hash == '#setlx-cheat_sheet') {
				window.select_tab('setlx');				
				$('#cheat_sheet').show();
				$('#quick_ref').hide();
      } else if (hash == '#setlx-quick_ref') {
				window.select_tab('setlx');				
				$('#quick_ref').show();
				$('#cheat_sheet').hide();
			} else {
				window.select_tab('main');
			}
    } else { 
			window.select_tab('main');
		}
		gtag('config', 'UA-115476228-1', { 'anonymize_ip': true });  
	};
  window.parse_anchor_hash();

  // Scroll to proc
  window.scroll_to_proc = function(file, name) {
    if (!$('#' + file).hasClass('selected')) {
      window.select_tab(file);
    }
    // console && console.log(file + ':' + name);
    var num = window.procs[file][name];
    if (num != null) {
      var line_no = $('#' + file + ' #L' + num);
      var scroll_top = line_no.offset()['top'];
      scroll_top = scroll_top - 200;
      $('html, body').animate({ scrollTop: scroll_top + 'px'}, 2000);
      line_no.next('.Identifier').css('background', 'white');
      line_no.next('.Identifier').css('color', '#333');
      window.blink($('#' + file + ' #L' + num).next('.Identifier'));
      setTimeout("$('#" + file + " #L" + num + "').next('.Identifier').css('background', ''); $('#" + file + " #L" + num + "').next('.Identifier').css('color', '');", 3000);
    }
  }

  // Glossary and code
  $('.Identifier').click(function() {
    var name = $(this).html().replace(/^\w+:/, '');
    var file = $(this).data('file');
    if (file) {
      window.scroll_to_proc(file, name);
    } else {
      arr = window.names[name];
      if (arr.length && arr.length > 1) {
        // arr of arr3 of file, proc, linenum
        // multiple procs with that name
        proc_arr = arr[0];
        file = proc_arr[1];
        if (!$('#glossary').is(':visible')) {
          $('#glossary-heading').click();
        }
        $("#glossary a:contains('" + abbr[file] + ":" + name + "')")[0].scrollIntoView();
        $('#glossary')[0].scrollBy(0, -60);
        
        $.each(arr, function(i, proc_arr) {
          file = proc_arr[1];
          name = proc_arr[0];
          str = abbr[file] + ':' + name;
          var el = $("#glossary a:contains('" + name + "')");
          blink(el);
        });
        return false;
      } else {
        file = arr[0][1];
        window.scroll_to_proc(file, name);
      }
    } 
  });

  // Key Concepts
  $('#concepts a').click(function() {
    var name = $(this).data('name');
    var file = $(this).data('file');
    var num  = $(this).data('num');
    if (num) {
      window.scroll_to_line(file, num);
    } else {			
      window.scroll_to_proc(file, name);
    }
  });

  // Menu
  $('.file').click(function() {
    var file = $(this).data('file');
    window.select_tab(file);
  });

  $('#help').click(function() {
    alert("Navigation Tips:\nClick on the magenta procedure calls in the code to jump to the definition of that procedure.\nYou can use your browser's back button to return to the previous click.\n\nIf the name of a procedure is ambiguous, it will instead bring up the links to the possible\nprocedures in the lower left Glossary.\n\nThe urls for these links in the Glossary or the code can also be copied and shared.\nLoading the page from such a url would take the user to that file and line number.");
  });

  window.toggle_links = function(j_el) {
    var chevron = j_el.find('.fas').last();      
    var links = j_el.parent().next();      
    if (chevron.hasClass('fa-chevron-right')) {
      chevron.removeClass('fa-chevron-right').addClass('fa-chevron-down');
      links.slideDown(300);
    } else {
      chevron.removeClass('fa-chevron-down').addClass('fa-chevron-right');
      links.slideUp(300);
    }
    // j_el.parent().next().toggle();
  };
  $('#sidebar .ribbon .heading').click(function() {
    if ($('.links:visible').length == 2 && 
        $(this).find('.fas').last().hasClass('fa-chevron-right')) { 
      if ($(this).attr('id') == 'glossary-heading') {
        window.toggle_links($('#about-heading'));        
      } else {
        window.toggle_links($('#glossary-heading'));
      }
    }
    window.toggle_links($(this));
  });

  $('#concepts li .fas').click(function() {
    var el = $(this).parent('li').find('> ul');
    if (el.is(':visible')) {
      $(this).removeClass('fa-caret-down').addClass('fa-caret-right');
      el.slideUp(500);
    } else {
      $(this).removeClass('fa-caret-right').addClass('fa-caret-down');
      el.slideDown();
    }
    // el.toggle();
  });

  window.onpopstate = function(event) {
    window.parse_anchor_hash();
  }

  var email = 'june' + '@' + 'metaethical.ai';
  $('#about p').append('<br/><span id="mail"><i class="fas fa-envelope"></i> <a href="mailto://' + email + '">' + email + '</a></span>');

  $('.cheat_sheet, .quick_ref').click(function() {
    $('#quick_ref').toggle();
    $('#cheat_sheet').toggle();
  });
}); // end document ready 
