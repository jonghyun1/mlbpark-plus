var scoreTpl = 
'<div id="score">\n' +
'	<div id="score_tab">\n' +
'		<ul>\n' +
'			<li class="tab1"><a href="#score_rank" class="selected">프로야구순위</a></li>\n' +
'			<li class="tab2"><a href="#score_result">지난경기결과</a></li>\n' +
'		</ul>\n' +
'	</div>\n' +
'	<div id="score_rank" style="display:block;"></div>\n' +
'	<div id="score_result" style="display:none;"></div>\n' +
'</div>\n';

$(document).ready(function() {
	//ScoreBoard load
	document.getElementsByClassName('article_box')[0].insertAdjacentHTML('beforeEnd', scoreTpl);
	$.get('http://mlbpark.donga.com/poll/score.html', function(response){
		var responseWrapper = $('<div />').append(response.replace(/<script(.|\s)*?\/script>/g, ''));

		$('#score_rank').append(responseWrapper.find('.scoreBoard'));
		$('#score_result').append(responseWrapper.find('#baseball2 div[id^="tab"]'));
		$('#tab7').css('display','block');

		//controller
		var $controller = $('a[href^="javascript:onclick=show_tab"]');
		var $tab = $('#score_result > div');

		$controller.on('click',function(e){
			var el = this.getAttribute('href').match(/[0-9]/);
			if (el > 0 && el <= 7){
				$tab.css('display','none');
				$('#tab' + el).css('display','block');
			}
			e.preventDefault();
		});
	});

	//scoreBoard tab
	var scoreRank = document.getElementById('score_rank');
	var scoreReslut = document.getElementById('score_result');

	$(document.body).on('click','#score_tab a', function(e){
		$('#score_tab a').removeClass('selected');
		this.className = 'selected';
		scoreRank.style.display = 'none';
		scoreReslut.style.display = 'none';
		$(this.hash)[0].style.display ='block';
		e.preventDefault();
	});

	//loginbox tabIndex
	var loginBox = document.getElementById('preViewQue2');
	if (loginBox.children[1].className == 'login') {
		document.getElementById('bid').setAttribute('tabindex','1');
		document.getElementById('bpw').setAttribute('tabindex','2');
		document.getElementById('idremember').setAttribute('tabindex','3');
		loginBox.querySelector('input[alt="로그인"]').setAttribute('tabindex','4');
	}

	//mypage href fix
	var mypageLink = document.querySelector('a[href="http://idolpark.donga.com/mypage/"]');
	if (mypageLink) {
		mypageLink.href = 'http://mlbpark.donga.com/mypage/';
	}
});