var loc = win.location;
var locHref = loc.href;
var path = loc.pathname;
var titIcons = {
	game: /디아|\[스타|프야매|lol|게임/i,
	female: /여자|처자|ㅊㅈ|여친|녀 |여성/,
	twitter: /(트윗|트위터)/,
	warn: /(혐짤|\[혐오|혐오\]|\(혐오|혐오\)|주의\]|주의\))/,
	adult: /(19금|\[19\] |\(19\)|주번나|성진국)/,
	tv: /(swf|avi|플짤|영상|flv)/i,
	vs: /(vs)/i,
	music: /(브금|bgm|음악|가수|노래|뮤직)/i,
	question: /(질문|요\?|여\?|죠\?|나요)/,
	img: /(짤방|jpg|gif|jyp)/i,
	mobile: /(맛폰)/
}
var teams = {
	kia: {
		teamName: /(\[기아\]\s?|\[kia\]\s?)/i,
		searchKeyword: 'kia+OR+%B1%E2%BE%C6'
	},
	nexen: {
		teamName: /(\[넥센\]\s?)/,
		searchKeyword: '%B3%D8%BC%BE'
	},
	doosan: {
		teamName: /(\[두산\]\s?)/,
		searchKeyword: '%B5%CE%BB%EA'
	},
	lotte: {
		teamName: /(\[롯데\]\s?)/,
		searchKeyword: '%B7%D4%B5%A5'
	},
	samsung: {
		teamName: /(\[삼성\]\s?)/,
		searchKeyword: '%BB%EF%BC%BA'
	},
	sk: {
		teamName: /(\[sk\]\s?)/i,
		searchKeyword: 'sk+OR+%BF%A1%BD%BA%C4%C9%C0%CC'
	},
	nc: {
		teamName: /(\[엔씨\]\s?|\[nc\]\s?)/i,
		searchKeyword: 'nc+OR+%BF%A3%BE%BE'
	},
	lg: {
		teamName: /(\[엘지\]\s?|\[lg\]\s?)/i,
		searchKeyword: 'lg+OR+%BF%A4%C1%F6'
	},
	hanwha: {
		teamName: /(\[한화\]\s?)/,
		searchKeyword: '%C7%D1%C8%AD'
	}
};

// Repeat parentNode
function up(el, n) {
	var parent = el;
	for(var i = 0; i < n; i++) {
		parent = parent.parentNode;
	}

	return parent;
}

function blockedTitle(elem, originTitle, keyword){
	var blockedTitleConfirm = function(e){
		if(!confirm('차단된 글을 열람하시겠습니까?')){
			e.preventDefault();
		}
	};

	elem.innerText = '차단 키워드('+ keyword +')가 포함된 글 입니다';
	elem.className = 'blockTitle';
	elem.title = '제목: ' + originTitle;
	elem.addEventListener('click', blockedTitleConfirm, false);
}

function createBlindButton(keyword, target){
	var containerClassName,
		buttonId,
		buttonText1,
		buttonText2;

	if (keyword === 'warn') {
		containerClassName = 'grayscale';
		buttonId = 'btn_color';
		buttonText1 = '경고 문구가 포함되어 본문을 흑백처리 합니다.';
		buttonText2 = ' 원문을 보시려면 클릭하세요.';
	} else {
		containerClassName = 'blind';
		buttonId = 'btn_blind';
		buttonText1 = '댓글에 '+ keyword + '가 포함된 글 입니다.';
		buttonText2 = ' 본문을 보시려면 클릭하세요.';
	}

	var buttonClick = function(){
		this.className = 'displayNone';

		if (keyword === 'warn') {
			target.classList.remove('grayscale');
		} else {
			target.style.maxHeight = target.offsetHeight + 'px';
			target.className += ' slide';
		}
	};

	target.className = containerClassName;

	var btnTitle = doc.createElement('span');
	btnTitle.innerText = buttonText1;

	var btnText = doc.createTextNode(buttonText2);
	var button = doc.createElement('div');

	button.id = buttonId;
	button.className = 'warnBtn';
	button.appendChild(btnTitle);
	button.appendChild(btnText);
	button.addEventListener('click', buttonClick, false);

	target.insertAdjacentElement('beforeBegin', button);
}

function Options(res) {
	this.isShowTitleIcon = res.isShowTitleIcon === 'true';
	this.isShowTeamIcon = res.isShowTeamIcon === 'true' && locHref.indexOf('mbsC=kbotown') > -1;
	this.isBlindContent = res.isBlindContent === 'true';
	this.blockKeywords = res.blockKeywords;
	this.blockKeywordslength = this.blockKeywords.length;
	this.isBlockArticle = res.isBlockArticle === 'true' && this.blockKeywordslength;
	this.blockType = res.blockType;
	this.blockNicknames = res.blockNicknames;
	this.blockNicknamesLength = this.blockNicknames.length;
	this.isBlockNickname = res.isBlockNickname === 'true';
	this.isShowUserHistory = res.isShowUserHistory === 'true';
	this.isInsertReplyButton = res.isInsertReplyButton === 'true';
	this.isEnableCommentView = res.isEnableCommentView === 'true';
	this.isResizeVideo = res.isResizeVideo === 'true';
	this.isBlockNotice = res.isBlockNotice === 'true';
	this.isEnableShortcutKey = res.isEnableShortcutKey === 'true';
	this.isEnableImageSearch = res.isEnableImageSearch === 'true';
}

function subjectLoop(links, linkDepth) {
	var teamSearchUrl = '/mbs/articleL.php?mbsC=kbotown&mbsW=search&keyword=';

	var subjectBlocker = {
		hidden: function(t) {
			up(t, 6).className = 'displayNone';
		},
		replace: function(t, title, keyword) {
			blockedTitle(t, title, keyword);
		}
	};

	var createTeamIcon = function(t, k, matchKeyword) {
		var label = doc.createElement('a');
		label.href = teamSearchUrl + teams[k].searchKeyword;
		label.className = 'teamIcon';
		label.setAttribute('data-team', k);
		t.innerText = title.replace(matchKeyword, '');
		t.parentNode.insertBefore(label, t);
	};

	listLinkLoop:
	for (var i = 0, len = links.length; i < len; i++) {
		var t = links[i].childNodes[linkDepth];
		var title = t.innerText.toLowerCase();

		// block subject
		if (o.isBlockArticle) {
			for (var b = 0; b < o.blockKeywordslength; b++) {
				var keyword = o.blockKeywords[b];

				if (title.indexOf(keyword) !== -1) {
					subjectBlocker[o.blockType](t, title, keyword);
					continue listLinkLoop;
				}
			}
		}

		// title icon
		if (o.isShowTitleIcon) {
			for (var key in titIcons) {
				if (titIcons[key].test(title)) {
					t.className = 'ico ico_' + key;
					break;
				}
			}
		}

		// team icon
		if (o.isShowTeamIcon) {
			for (var k in teams) {
				var matched = teams[k].teamName.exec(title);
				if (matched) {
					createTeamIcon(t, k, matched[1]);
					break;
				}
			}
		}
	}
}

function categoryLoop() {
	//notice blind
	if (!o.isBlockNotice) return;

	var cat = container.getElementsByClassName('A11gray');
	for (var i = 0, len = cat.length; i < len; i++) {
		var t = cat[i];
		if(t.textContent !== '공지') break;
		up(t, 5).className = 'displayNone';
	}
}

function nicknameLoop(nickEl, upCount) {
	//user block
	if (!o.isBlockNickname) return;

	for (var i = 0, len = nickEl.length; i < len; i++) {
		if (o.blockNicknames.indexOf(nickEl[i].text) > -1) {
			up(nickEl[i], upCount).className = 'displayNone';
		}
	}
}

function bestArticleLoop() {
	if (!o.isBlockArticle) return;

	var bestLink = doc.querySelectorAll('td[width="190"] a');
	var bestLinkLen = bestLink.length;

	var blocker = {
		hidden: function(t) {
			var upCount = t.parentNode.tagName == 'STRONG' ? 3 : 2;
			up(t, upCount).className = 'displayNone';
		},
		replace: function(t, title, keyword) {
			blockedTitle(t, title, o.blockKeywords[b]);
		}
	};

	for (var i = 0; i < bestLinkLen; i++) {
		var t = bestLink[i];
		var title = t.text.toLowerCase();

		for (var b = 0; b < o.blockKeywordslength; b++) {
			if (title.indexOf(o.blockKeywords[b]) !== -1) {
				blocker[o.blockType](t, title, o.blockKeywords[b]);
				break;
			}
		}
	}
}

chrome.extension.sendMessage({action:'mbs'}, function(response) {
	o = new Options(response);

	doc.addEventListener('DOMContentLoaded', function(){
		if (path !== '/mbs/commentV.php') {
			var container = doc.getElementById('container');
			var listLink = container.getElementsByClassName('G12read');

			var linkDepth;
			var nickEl;
			var upCount;

			if (path == '/bbs/mlb_today.php') {
				linkDepth = 0;
				nickEl = container.querySelectorAll('td[width="82"] > font');
				upCount = 6;
			} else {
				linkDepth = 1;
				nickEl = container.querySelectorAll('td[width="82"] > font > a');
				upCount = 7;
			}

			// KBL bbs only
			if (o.isShowTeamIcon) {
				doc.body.id = 'team_show';
			}

			subjectLoop(listLink, linkDepth);
			categoryLoop()
			nicknameLoop(nickEl, upCount);
			bestArticleLoop();
		}

		if (locHref.indexOf('V.php') > -1){
			var myArea = doc.getElementById('myArea');

			function userBlock_cmt(){
				if (o.isBlockNickname) {
					var CmtNickEl = doc.querySelectorAll('td[width="140"] > font > a');
					for (var u = 0, CmtNickElLen = CmtNickEl.length; u < CmtNickElLen; u++) {
						for (var i = 0; i < o.blockNicknamesLength; i++) {
							if (CmtNickEl[u].innerText === o.blockNicknames[i]) {
								up(CmtNickEl[u], 7).className = 'displayNone';
								break;
							}
						}
					}
				}
			}userBlock_cmt();

			if (path == '/mbs/articleV.php') {
				var article = doc.querySelector('.G13 > div[align="justify"]');
				var userEl = doc.querySelector('div[id^="nik_"]');
				var userId =  userEl.children[0].children[0].getAttribute('onclick').match(/id=([^&]+)\'/)[1];
				var nickname = userEl.nextElementSibling.innerText;

				//content blind
				if (o.isBlindContent) {
					var subject = container.getElementsByTagName('strong')[0].innerText;

					$.expr[':'].Contains = function(a,i,m){
						return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
					};

					if ($(myArea).find('.G12:Contains("COB")').length > 0) {
						createBlindButton('COB', article);
					} else if ($(myArea).find('.G12:contains("비누")').length > 0) {
						createBlindButton('비누', article);
					} else if(titIcons.warn.test(subject)) {
						createBlindButton('warn', article);
					}
				}

				//add userId
				var idEl = doc.createElement('span');
				idEl.className = 'userIdVal';
				idEl.innerText = '(' + userId + ')';
				userEl.parentNode.appendChild(idEl);

				//user history
				if (o.isShowUserHistory) {
					var historyEl = doc.createElement('div');
					var historyHeadEl = doc.createElement('div');
					var historyTitleEl = doc.createElement('h3');
					var historyMoreBtn = doc.createElement('button');
					var historyListEl = doc.createElement('div');
					historyEl.id = 'history';
					historyHeadEl.className = 'historyHead';
					historyTitleEl.innerText = nickname;
					historyTitleEl.title = userId;
					historyMoreBtn.type = 'button';
					historyMoreBtn.innerText = '[더 보기]';
					historyMoreBtn.setAttribute('onclick','MlbNewWindow2(\'http://mlbpark.donga.com/mypage/my_bulletin2011.php?mbsUid='+userId+'\',\'550\',\'500\')');
					historyListEl.id = 'historyList';
					historyHeadEl.appendChild(historyTitleEl);
					historyHeadEl.appendChild(historyMoreBtn);
					historyEl.appendChild(historyHeadEl);
					historyEl.appendChild(historyListEl);
					article.insertAdjacentElement('afterEnd',historyEl);

					$.ajax({
						type: 'GET',
						url: 'http://mlbpark.donga.com/mypage/my_bulletin2011.php?mbsUid=' + userId,
						cache: false,
						timeout: 5000,
						success: function(response){
							$(historyListEl).append($(response).find('td[bgcolor="#FFFFFF"] > table:nth-child(2)')[0].outerHTML).find('a[target]').removeAttr('target');
						},
						error: function(xhr, textStatus, errorThrown){
							var errorEl = doc.createElement('p');
							errorEl.id = 'errerMessage';
							errorEl.innerText = '오류가 발생하여 최근 글을 불러올 수 없습니다. ';
							historyListEl.appendChild(errorEl);
						}
					});
				}

				//google search by image
				if (o.isEnableImageSearch) {
					var images = article.getElementsByTagName('img');

					win.onload = function(){
						for (var i = 0, imagesLen = images.length; i < imagesLen; i++) {
							var img = images[i];
							var width = img.clientWidth;
							var height = img.clientHeight;

							if (!img.complete || typeof img.naturalWidth == "undefined" || img.naturalWidth === 0) {
								img.className = 'displayNone';

								var imgOnerror = doc.createElement('div');
								imgOnerror.className = 'imgOnerror';

								var imgOnerrorTitle = doc.createElement('h3');
								imgOnerrorTitle.innerText = '이미지 로드 실패';

								var imgOnerrorLink = doc.createElement('a');
								imgOnerrorLink.href = img.src;
								imgOnerrorLink.target = '_blank';
								imgOnerrorLink.innerHTML = '외부 링크가 차단된 이미지일 수 있습니다.<br>클릭 후 주소입력창에서 엔터 키를 눌러보세요';

								imgOnerror.appendChild(imgOnerrorTitle);
								imgOnerror.appendChild(imgOnerrorLink);


								img.insertAdjacentElement('afterEnd', imgOnerror);
							}

							if (width && height > 50) {
								var src = img.src;
								if(src.substr(0,7) != 'http://') {
									src = 'http://mlbpark.donga.com' + src;
								}

								var btn_iSearch = doc.createElement('a');
								btn_iSearch.href = 'https://www.google.com/searchbyimage?image_url='+ src;
								btn_iSearch.className = 'btn_iSearch';
								btn_iSearch.target = '_blank';
								btn_iSearch.title = '구글에서 이미지 검색';

								var imageWrap = doc.createElement('span');
								imageWrap.className = 'iWrap';

								if (img.parentNode.tagName.toLowerCase() == 'a') {
									var wrapImg = img.parentNode;
									wrapImg.parentNode.insertBefore(imageWrap, wrapImg);
									imageWrap.appendChild(wrapImg);
								} else {
									img.parentNode.insertBefore(imageWrap,img);
									imageWrap.appendChild(img);
								}

								imageWrap.appendChild(btn_iSearch);
							}
						}
					};
				}

				//videoCss
				if (o.isResizeVideo) {
					var vdoCss = doc.createElement('link');
					vdoCss.rel = 'stylesheet';
					vdoCss.href = chrome.extension.getURL('/css/video.css');
					doc.head.appendChild(vdoCss);
				}

				function commentUser(){
					var cmtName = myArea.querySelectorAll('td[width="140"] a');

					for (var i = 0, cmtNameLen = cmtName.length; i < cmtNameLen; i++) {
						var t = cmtName[i];

						//highlight comment writer
						if (t.innerText === nickname) {
							t.className = 'me';
						}

						//view userComment
						if (o.isEnableCommentView) {
							var viewCmt = doc.createElement('button');
							viewCmt.type = 'button';
							viewCmt.className = 'btn_userCmt',
							viewCmt.title = '이 글에 단 댓글 보기';
							viewCmt.innerText = '?';
							t.parentNode.appendChild(viewCmt);
						}
					}

					if (o.isEnableCommentView) {
						var btn_userCmt = myArea.querySelectorAll('.btn_userCmt');
						$(btn_userCmt).on('click',function(){
							var t = this;
							$.ajax({
								type: 'GET',
								url: 'http://mlbpark.donga.com/mbs/commentRV.php',
								data: {
									mbsC: mbsC,
									comment_ymd: wday,
									comment_idx: mbsIdx
								},
								cache: false,
								success: function(response) {
									var selectUser = t.previousSibling.innerText;
									doc.body.insertAdjacentHTML('beforeEnd',
										'<div id="commentModal">\n'+
										'	<div id="commentModalMask"></div>\n'+
										'	<div id="commentModalBox">\n'+
										'		<div id="modalHead">\n'+
										'			<h3><strong>'+selectUser+'</strong> 님이 이 글에 남긴 댓글 <span id="cmtCount"></span></h3>\n'+
										'			<button type="button" id="commentModalClose" title="닫기">close</button>\n'+
										'		</div>\n'+
										'		<div id="userCmtList"></div>\n'+
										'		<form id="modalForm" name="writeForm2" method="post" action="commentWE.php">\n'+
										'			<input type="hidden" name="mbsC" value="'+mbsC+'" />\n'+
										'			<input type="hidden" name="mbsIdx" value="'+mbsIdx+'" />\n'+
										'			<input type="hidden" name="wday" value="'+wday+'" />\n'+
										'			<textarea id="modalFormTextarea" name="line_content" cols="75" rows="3" autocomplete="off">'+selectUser+'// </textarea>\n'+
										'			<button type="submit">댓글 등록</button>\n'+
										'		</form>\n'+
										'	</div>\n'+
										'</div>\n'
									);

									var responseWrapper = $('<div />').append(response.replace(/<script(.|\s)*?\/script>/g, '')),
									cmt = responseWrapper.find('a[title=" 에게 메모 보내기"]:contains("' + selectUser + '")'),
									cmtVal = cmt.closest('td').nextAll();
									var cmtCount = cmt.length;
									var el_modal = doc.getElementById('commentModalBox');
									var el_cmtCount = doc.getElementById('cmtCount');
									var el_userCmtList = doc.getElementById('userCmtList');

									el_cmtCount.innerText = '(' + cmtCount + ')';
									$(el_userCmtList).append(cmtVal);

									var vPosition = el_modal.offsetHeight*-.5;
									el_modal.style.marginTop = vPosition + 'px';

									$('#modalFormTextarea').on('click',function(){
										if ($('#loginArea a:first-child').text() == '로그인'){
											if (confirm('로그인 후 사용 가능합니다.\n로그인 페이지로 이동하시겠습니까?') === true){
												win.location = 'http://www.donga.com/members/login.php\?gourl=' + escape(locHref);
											}
										}
									});
								},
								beforeSend : function(){
									t.classList.add('userCmtLoading');
								},
								complete: function(){
									t.classList.remove('userCmtLoading');
								}
							});
						});

						$(doc.body).on('click','#commentModalMask,#commentModalClose',function(){
							$('#commentModal').remove();
						});
					}
				}
				commentUser();

				// View voter
				(function viewVoter(){
					var voterGroud = doc.querySelector('td.D11[width="117"]');

					var child;
					while (child = voterGroud.lastChild) {
						voterGroud.removeChild(child);
					}

					var voterListFrag = doc.createDocumentFragment();

					var viewVoterBtn = doc.createElement('span');
					viewVoterBtn.id = 'viewVoter';
					viewVoterBtn.innerText = '추천인 보기';

					var voterList = doc.createElement('div');
					voterList.id = 'voterList';
					voterList.style.display = 'none';
					voterList.addEventListener('click',function(e){
						e.stopPropagation();
					});

					var voterListHead = doc.createElement('header');
					voterListHead.className = 'voterListHead';

					var voterListHeadding = doc.createElement('h3');
					voterListHeadding.innerText = '추천한 사람들';

					var voterListClose = doc.createElement('span');
					voterListClose.id = 'voterListClose';
					voterListClose.innerText = 'X';
					voterListClose.addEventListener('click', function(){
						voterList.style.display = 'none';
					});

					var voterOl = doc.createElement('ol');

					voterListHead.appendChild(voterListHeadding);
					voterListHead.appendChild(voterListClose);
					voterList.appendChild(voterListHead);
					voterList.appendChild(voterOl);

					voterListFrag.appendChild(viewVoterBtn);
					voterListFrag.appendChild(voterList);

					voterGroud.appendChild(voterListFrag);

					viewVoterBtn.addEventListener('click', function(e){
						e.stopPropagation();
						if (voterOl.childElementCount === 0) {
							$.ajax({
								type: 'GET',
								url: 'http://mlbpark.donga.com/mbs/articleVoteList.php',
								data: {
									bbs: mbsC,
									article_id: mbsIdx
								},
								async: true,
								cache: false,
								success: function(data){
									if(data === ''){
										var emptyMsg = doc.createElement('li');
										emptyMsg.className = 'emptyMsg';
										emptyMsg.innerText = '아직 추천한 사람이 없습니다';
										voterOl.appendChild(emptyMsg);
									} else {
										voterOl.innerHTML = data;
										if (o.isBlockNickname) {
											var voterListLi = voterOl.querySelectorAll('li');
											for(var x = 0, len = voterListLi.length; x < len; x++){
												var t = voterListLi[x];
												for (var i = 0; i < o.blockNicknamesLength; i++) {
													if(t.innerText === o.blockNicknames[i]){
														t.className = 'blockUser';
														break;
													}
												}
											}
										}
									}
								}
							});
						}
						voterList.style.display = 'block';
					});
				}());
			}

			//text URL replacement
			function urlReplace(){
				var replacePattern1 = /\s(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
				replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/ig,
				replaceTxt1 = ' <a href="$1" target="_blank">$1</a>',
				replaceTxt2 = ' <a href="http://$2" target="_blank">$2</a>';

				$(myArea).find('.G12').html(function(i, val) {
					return val.replace(replacePattern1, replaceTxt1).replace(replacePattern2, replaceTxt2);
				});
			}
			urlReplace();

			//reply button
			var textarea = doc.getElementsByName('line_content')[0];

			function replyButton(){
				var cmtTxt = myArea.querySelectorAll('.G12');
				var cmtTxtLen = cmtTxt.length;
				if (o.isInsertReplyButton && cmtTxtLen > 0) {
					for (var i = 0; i < cmtTxtLen; i++) {
						var replyBtn = doc.createElement('button');
						replyBtn.type = 'button';
						replyBtn.className = 'btn_reply';
						replyBtn.title = '답글 달기';
						replyBtn.innerText = '[답글]';
						replyBtn.idx = i;
						replyBtn.onclick = function(j){
							return function(){
								if (textarea.value !== '' && !confirm('아직 작성 중인 댓글이 있습니다.\n다시 작성하시겠습니까?')){
									return false;
								}
								var cmtUsername = up(cmtTxt[j],5).children[0].getElementsByTagName('a')[0].innerText;
								textarea.focus();
								textarea.value = cmtUsername + '// ';
							};
						}(i);
						cmtTxt[i].appendChild(replyBtn);
					}
				}
			}
			replyButton();

			//comment refresh
			var mbsC = doc.getElementsByName('mbsC')[0].value;
			var mbsIdx =  doc.getElementsByName('mbsIdx')[0].value;
			var wdayKey = (path == '/mbs/commentV.php') ? 'co_day' : 'wday';
			var wday = doc.getElementsByName(wdayKey)[0].value;

			var cmtLoader = doc.createElement('div');
			var cmtLoadBtn = doc.createElement('button');
			cmtLoader.id = 'cmtLoader';
			cmtLoadBtn.id = 'btn_cmtLoad';
			cmtLoadBtn.type = 'button';
			cmtLoadBtn.innerText = '최신 댓글 불러오기';
			cmtLoader.appendChild(cmtLoadBtn);

			cmtLoadBtn.onclick = function(){
				$.ajax({
					type: 'post',
					async: true,
					url: 'http://mlbpark.donga.com/mbs/commentRV.php?mbsC='+mbsC+'&comment_ymd='+wday+'&comment_idx='+mbsIdx,
					beforeSend: function() {
						cmtLoader.className = 'loaderShow';
					},
					success: function(data) {
						$(myArea).html(data);
						if (path !== '/mbs/articleL.php') {
							userBlock_cmt();
						}
						if (path == '/mbs/articleV.php') {
							commentUser();
						}
					},
					complete: function() {
						urlReplace();
						replyButton();
						addUserBlock(myArea);
						cmtLoader.className = 'loaderHide';
					}
				});
			};

			myArea.parentNode.insertBefore(cmtLoader, myArea.nextSibling);
		}

		//tab Navigation highlighter
		if (locHref.indexOf('mbsW=search') > -1){
			$.urlParam = function(name){
				var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(locHref);
				return results[1] || 0;
			};

			switch ($.urlParam('mbsC')) {
				case 'bullpen':
					doc.getElementById('navi4').className = 'on';
				break;
				case 'kbotown':
					doc.getElementById('navi3').className = 'on';
				break;
				case 'mlbtown':
					doc.getElementById('navi2').className = 'on';
				break;
			}
		}

		if (path !== '/mbs/commentV.php' && path !== '/bbs/mlb_today.php') {
			//shotcut keys
			var paging = container.getElementsByClassName('paging');
			var $currentPage = $(paging).find('font');

			$(paging).find('> img').remove();

			var pLink = $currentPage[0].previousSibling.href;
			var nLink = $currentPage[0].nextSibling.href;

			if (o.isEnableShortcutKey) {
				var listEl = doc.querySelector('table[height="31"]');

				doc.addEventListener('keyup', function(e) {
					if (path === '/mbs/commentV.php') return;
					if ($(e.target).is('input, textarea')) return;

					switch(e.which) {
						case 65:
							win.location.href = pLink;
						break;
						case 83:
							win.location.href = nLink;
						break;
						case 68:
							var listElTop = listEl.getBoundingClientRect().top + win.pageYOffset;
							var currentTop = doc.body.scrollTop;
							var topVal = listElTop - currentTop;

							doc.body.style.cssText = '-webkit-transform:translate(0, '+ topVal +'px)';
							win.scroll(0,listElTop);
							doc.body.style.cssText = '-webkit-transform:translate(0,0);transition:-webkit-transform .5s ease;';

							$(doc.body).on('webkitTransitionEnd transitionend', function(){
								doc.body.style.transition = 'none';
							});
						break;
					}
				}, false);
			}

			//prerender
			var target = doc.head;
			prNext = doc.createElement('link');
			prNext.rel = 'prerender';
			prNext.href = nLink;
			prPrev = doc.createElement('link');
			prPrev.rel = 'prerender';
			prPrev.href = pLink;
			target.appendChild(prNext);
			target.appendChild(prPrev);
		}

		// Add a 'User Block' to User Menu
		if (o.isBlockNickname) {
			function addUserBlock(scop){
				var userMenu = scop.querySelectorAll('div[id^=nik_]');
				for (var i = 0, userMenuLen = userMenu.length; i < userMenuLen; i++) {
					var t = userMenu[i];
					var blockLiEl = doc.createElement('li');
					blockLiEl.setAttribute('data-user', t.nextElementSibling.innerText);
					blockLiEl.innerText = '닉네임 차단';

					t.getElementsByTagName('ul')[0].appendChild(blockLiEl);
				}
				$('li[data-user]').on('click', function(){
					win.postMessage({
						action:'userBlockDelivery',
						user: this.getAttribute('data-user')
					}, '*');
					return false;
				});
			}
			addUserBlock(doc);
		}
	}, false);
});

win.addEventListener('message', function(e) {
	if (win != e.source) return;

	switch(e.data.action) {
		case 'userBlockDelivery' :
			chrome.extension.sendMessage(
				{
					action: e.data.action,
					data: e.data
				},
				function(response) {
					if(response.result) {
						alert('"' + response.user + '" 님을 닉네임 차단에 등록했습니다.');
						location.reload();
					} else {
						alert('닉네임 차단을 실패했습니다.\n' + response.message);
					}
				}
			);
		break;
	}
}, false);