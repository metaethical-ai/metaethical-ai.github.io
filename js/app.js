$(document).ready(function() {
	set_width();
	$(window).resize(function() {
		set_width();
	});
	var email = 'june' + '@' + 'metaethical.ai';
	$('#mailto').attr('href', 'mailto://' + email);
	$('#mailto').html(email);
	setTimeout("set_width()", 1000);
	setTimeout("set_width()", 4000);
});

set_width = function() {
	if (window.innerHeight < window.innerWidth) {
		var width =	parseInt($(window).width()) - 
								parseInt($('#left').css('width')) - 5 + 'px';
		$('#right').css('width', width);
	}
}

toggle_page = function() {
	var home_active = parseInt($('#home').css('top')) == 0;
	speed = 600;
	if (home_active) {
		active = '#home';
		other = '#abstract';
		$(active).animate({ top: '100vh' }, speed, 'swing');
		$(other).animate({ top: '0' }, speed, 'swing');
	} else {
		active = '#abstract';
		other = '#home';
		$(active).animate({ top: '-100vh' }, speed, 'swing');
		$(other).animate({ top: '0' }, speed, 'swing');
	}
}

